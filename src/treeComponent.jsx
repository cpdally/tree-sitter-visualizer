import { useState, useEffect, useRef } from 'react';
import { Tree } from 'primereact/tree';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Prism } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TreeComponent = (props) => {
  const [nodes, setNodes] = useState([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [contextNodeInfo, setContextNodeInfo] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [visible, setVisible] = useState(false);
  const contextMenu = useRef(null);
  const [selectedNodeKey, setSelectedNodeKey] = useState(null);

  useEffect(() => {
    if (props.parsedTree) {
      setNodes(props.parsedTree.children);
    }
  }, [props.parsedTree]);

  const onSelect = (event) => {
    setSelectedNodeInfo(event.node.data);
    setContextNodeInfo(event.node.data);
  };

  const onContextMenu = (event) => {
    contextMenu.current.show(event.originalEvent);
    setContextNodeInfo(event.node.data);
  };

  const menuItems = [
    {
      label: 'View Code',
      icon: 'pi pi-info',
      command: () => setVisible(true),
    },
  ];

  return (
    <div className="tree">
      {/* Context Menu */}
      <ContextMenu model={menuItems} ref={contextMenu} />
      {/* Source Code Dialog */}
      <Dialog header="Source Code" visible={visible} modal={false} maximizable style={{ width: '40vw' }} onHide={() => setVisible(false)}>
        {contextNodeInfo && (
          <div className="code-portion">
            <Prism language="js" style={oneLight}>
              {contextNodeInfo.text}
            </Prism>
          </div>
        )}
      </Dialog>
      <Splitter style={{ height: '80vh', overflow: 'auto' }} layout='vertical'>
        {/* Tree Panel */}
        <SplitterPanel size={70} minSize={50} style={{ overflow: 'auto' }}>
          <div style={{ width: '100%' }}>
            <Tree
              value={nodes}
              selectionMode="single"
              onSelect={onSelect}
              filter
              contextMenuSelectionKey={selectedNodeKey}
              onContextMenuSelectionChange={(e) => setSelectedNodeKey(e.value)}
              filterMode="lenient"
              filterPlaceholder="Search for a node"
              expandedKeys={expandedKeys}
              onToggle={(e) => setExpandedKeys(e.value)}
              onContextMenu={onContextMenu}
              className="p-tree"
            />
          </div>
        </SplitterPanel>
        {/* Selected Node Info Panel */}
        <SplitterPanel size={30} minSize={0} style={{ overflow: 'auto' }}>
          <div style={{ width: '100%' }}>
            {selectedNodeInfo && (
              <div className="node-info-card" style={{ fontSize: '0.9em' }} >
                <div className="card-header">
                  <h2>{selectedNodeInfo.type}</h2>
                  <p>typeId: {selectedNodeInfo.typeId}</p>
                </div>
                <div className="card-body">
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {Object.entries(selectedNodeInfo).slice(0, -2).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default TreeComponent;
