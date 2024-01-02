const express = require("express");
const Parser = require("tree-sitter");
const JavaScript = require("tree-sitter-javascript");

const app = express();
const port = 3030; // Port to run the server on (temporary for testing: 3030)

const parser = new Parser();
parser.setLanguage(JavaScript);

// Middleware to allow CORS
app.use((req, res, next) => {
    // Allow requests from any origin (temporary for testing)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.json());

/**
 * Parse the AST and build a tree for React
 * @param {Node} astNode - AST node to be parsed
 * @returns {Object} - React tree node
 */
const parseTree = (astNode) => {
    const children = astNode.children.map(parseTree);

    // Check if the node has children by inspecting .firstChild
    const hasChildren = astNode.firstChild !== null;

    // Define icons based on node types
    const iconMapping = {
        'lexical_declaration': 'pi pi-fw pi-file',
        'identifier': 'pi pi-fw pi-tag',
        'expression_statement': 'pi pi-fw pi-code',
        'call_expression': 'pi pi-fw pi-phone',
        'member_expression': 'pi pi-fw pi-users',
        'property_identifier': 'pi pi-fw pi-list',
        'array': 'pi pi-fw pi-sort',
        'statement_block': 'pi pi-fw pi-folder',
        'if_statement': 'pi pi-fw pi-question',
        'else_clause': 'pi pi-fw pi-arrow-right',
        'return_statement': 'pi pi-fw pi-reply',
        'parenthesized_expression': 'pi pi-fw pi-circle',
        'jsx_element': 'pi pi-fw pi-react',
        'jsx_opening_element': 'pi pi-fw pi-arrow-down',
        'jsx_closing_element': 'pi pi-fw pi-arrow-up',
        'jsx_self_closing_element': 'pi pi-fw pi-arrow-up',
        'jsx_attribute': 'pi pi-fw pi-link',
        'jsx_expression': 'pi pi-fw pi-search-plus',
        'spread_element': 'pi pi-fw pi-star',
        'comment': 'pi pi-fw pi-comment',
        'string': 'pi pi-fw pi-file-export',
        'string_fragment': 'pi pi-fw pi-file-import',
        'number': 'pi pi-fw pi-sort-numeric-up',
        'object': 'pi pi-fw pi-folder-open',
        'pair': 'pi pi-fw pi-linkedin',
    };

    // Get the icon based on the node type, or use a default icon if not found
    const icon = iconMapping[astNode.type] || '';

    // Build the node for React tree
    const node = {
        key: (astNode.startIndex + astNode.endIndex).toString(), // Use the node's start and end indices as the key
        label: astNode.type,
        data: {
            type: astNode.type,
            isNamed: astNode.isNamed,
            startIndex: astNode.startIndex,
            endIndex: astNode.endIndex,
            toString: astNode.toString(),
            typeId: astNode.typeId,
            text: astNode.text,
        },
        icon: icon,
        children: hasChildren ? children : [],
    };

    return node;
};

/**
 * Get the relationship between two nodes
 * @param {Node} sourceNode - First node
 * @param {Node} targetNode - Second node
 * @returns {String} - Relationship between the two nodes
 * @example - getRelationshipBetweenNodes(sourceNode, targetNode) => ".firstChild.nextSibling"
 */
const getRelationshipBetweenNodes = (sourceNode, targetNode) => {
    let relationship = "";
    let currentParent = targetNode.parent;
    let currentChild = targetNode;

    while (currentParent !== sourceNode.parent && currentParent !== null) {
        let parentChild = currentParent.firstChild;

        while (currentChild !== parentChild) {
            parentChild = parentChild.nextSibling;
            relationship = ".nextSibling" + relationship;
        }
        relationship = ".firstChild" + relationship;
        currentChild = currentParent;
        currentParent = currentParent.parent;
    }

    return relationship;
};

app.post("/parse", (req, res) => {
    try {
        const { code } = req.body;
        const tree = parser.parse(code);
        const parsedTree = parseTree(tree.rootNode);
        res.json(parsedTree);
    } catch (error) {
        console.error("Error parsing code:", error);
        res.status(400).json({ error: 'Bad request. Please check your code.' });
    }
});

app.post("/query", (req, res) => {
    try {
        const { code, query } = req.body;
        const tree = parser.parse(code);
        const queryObj = new Parser.Query(JavaScript, query);

        // Use queryObj.captures to capture multiple matches
        const matches = queryObj.captures(tree.rootNode).map((capture) => {
            // Use parseTree to convert each capture to a tree node
            return parseTree(capture.node);
        });

        res.json({ matches });
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(400).json({ error: 'Bad request. Please check your query.' });
    }
});

app.post("/getRelationship", (req, res) => {
    try {
        const { code, sourceNodeKey, targetNodeKey } = req.body;
        const tree = parser.parse(code);
        const sourceNode = tree.rootNode.descendantForIndex(parseInt(sourceNodeKey));
        const targetNode = tree.rootNode.descendantForIndex(parseInt(targetNodeKey));
        const relationship = getRelationshipBetweenNodes(sourceNode, targetNode);
        res.json({ relationship });
    } catch (error) {
        console.error("Error getting relationship:", error);
        res.status(400).json({ error: 'Bad request. Please check your inputs.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
