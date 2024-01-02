import React, { useState, useRef } from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Toast } from 'primereact/toast';
import { highlight, languages } from 'prismjs/components/prism-core';
import TreeComponent from './treeComponent';
import Editor from 'react-simple-code-editor';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

function App() {
  const [code, setCode] = useState(`function name(arg1, arg2) {\n  let x = 0;\n  if (arg1 > 0) {\n    assert(false);\n  } else {\n    assert(true);\n  }\n  return x;\n}`);
  const [query, setQuery] = useState(`(if_statement\n\tcondition: (parenthesized_expression) @condition\n\tconsequence: (_)\n)`);
  const [parsedTree, setParsedTree] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [activeCodeTabIndex, setActiveCodeTabIndex] = useState(0);
  const [activeTreeTabIndex, setActiveTreeTabIndex] = useState(0);
  const toast = useRef(null);

  const handleCodeSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3030/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add a parent node to the tree so that the TreeComponent can render it
        const newParentNode = {
          key: 'parent',
          label: 'Parent Node',
          children: [data],
        };
        setParsedTree(newParentNode);
        setActiveTreeTabIndex(0); // Switch to Code tab
        showToast('success', 'Code parsed successfully!');
      } else {
        console.error('Server returned an error:', response.statusText);
        showToast('error', 'Error parsing code. Please check the code and try again.');
      }
    } catch (error) {
      console.error('An error occurred during the fetch:', error);
      showToast('error', 'An error occurred. Please try again later.');
    }
  };

  const handleQuerySubmit = async () => {
    try {
      const response = await fetch('http://localhost:3030/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, query }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add a parent node to the tree so that the TreeComponent can render it
        const newParentNode = {
          key: 'parent',
          label: 'Parent Node',
          children: data.matches,
        };
        setQueryResults(newParentNode);
        setActiveTreeTabIndex(1); // Switch to Query tab
        showToast('success', 'Query executed successfully!');
      } else {
        console.error('Server returned an error:', response.statusText);
        showToast('error', 'Invalid Query. Please check the query and try again.');
      }
    } catch (error) {
      console.error('An error occurred during the fetch:', error);
      showToast('error', 'An error occurred. Please try again later.');
    }
  };

  const showToast = (severity, detail) => {
    toast.current.show({ severity, summary: severity === 'success' ? 'Success' : 'Error', detail, life: 3000 });
  };

  return (
    <PrimeReactProvider>
      <Toast ref={toast}/>
      <Splitter style={{ height: '100vh' }}>
        {/* Left Half - Code and Query Input */}
        <SplitterPanel>
          <div style={{ width: '100%' }}>
            <TabView activeIndex={activeCodeTabIndex} onTabChange={(e) => setActiveCodeTabIndex(e.index)}>
              <TabPanel header="Code Input">
                <Editor
                  value={code}
                  onValueChange={(code) => setCode(code)}
                  highlight={(code) => highlight(code, languages.js)}
                  padding={10}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    overflow: 'auto',
                    height: '80vh',
                  }}
                />
                <div style={{ marginTop: '10px' }}>
                  <Button label="Run Code" icon="pi pi-check" onClick={handleCodeSubmit} />
                </div>
              </TabPanel>
              <TabPanel header="Query Input">
                <Editor
                  value={query}
                  onValueChange={(query) => setQuery(query)}
                  highlight={(query) => highlight(query, languages.js)}
                  padding={10}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    overflow: 'auto',
                    height: '80vh',
                  }}
                />
                <div style={{ marginTop: '10px' }}>
                  <Button label="Run Query" icon="pi pi-search" onClick={handleQuerySubmit} />
                </div>
              </TabPanel>
            </TabView>
          </div>
        </SplitterPanel>

        {/* Right Half - Tree Component */}
        <SplitterPanel>
          <div style={{ width: '100%' }}>
            <TabView activeIndex={activeTreeTabIndex} onTabChange={(e) => setActiveTreeTabIndex(e.index)}>
              <TabPanel header="Abstract Syntax Tree">
                {parsedTree && <TreeComponent parsedTree={parsedTree} codeInput={code} />}
              </TabPanel>
              <TabPanel header="Query Matches">
                {queryResults && <TreeComponent parsedTree={queryResults} codeInput={code} />}
              </TabPanel>
            </TabView>
          </div>
        </SplitterPanel>
      </Splitter>
    </PrimeReactProvider>
  );
}

export default App;
