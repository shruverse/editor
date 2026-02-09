import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createEditor, Transforms, Editor, Text, Node } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import './DocumentBuilder.css';

const DocumentBuilder = () => {
    const initialContent = useMemo(() => [
        {
            type: 'paragraph',
            children: [{ text: '' }],
        },
    ], []);

    const [allContent, setAllContent] = useState(initialContent);
    const [pages, setPages] = useState([[]]);
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const measureRef = useRef(null);
    const isDistributing = useRef(false);

    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    const toggleFormat = (format) => {
        const isActive = isFormatActive(editor, format);
        Transforms.setNodes(
            editor,
            { [format]: isActive ? null : true },
            { match: Text.isText, split: true }
        );
    };

    const toggleBlock = (format) => {
        const isActive = isBlockActive(editor, format);
        Transforms.setNodes(
            editor,
            { type: isActive ? 'paragraph' : format },
            { match: n => Editor.isBlock(editor, n) }
        );
    };

    const isFormatActive = (editor, format) => {
        try {
            const [match] = Editor.nodes(editor, {
                match: n => n[format] === true,
                mode: 'all',
            });
            return !!match;
        } catch (e) {
            return false;
        }
    };

    const isBlockActive = (editor, format) => {
        try {
            const [match] = Editor.nodes(editor, {
                match: n => n.type === format,
            });
            return !!match;
        } catch (e) {
            return false;
        }
    };

    const distributeContentToPages = useCallback((content) => {
        if (isDistributing.current || !measureRef.current) return;

        isDistributing.current = true;

        requestAnimationFrame(() => {
            const pageHeight = 792; // 11 inches at 72 DPI
            const newPages = [];
            let currentPage = [];
            let currentHeight = 0;

            // Create temporary container for measurement
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: 612px;
        padding: 72px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      `;
            document.body.appendChild(tempContainer);

            content.forEach((node) => {
                const nodeText = Node.string(node);
                let elem;

                switch (node.type) {
                    case 'heading-one':
                        elem = document.createElement('h1');
                        elem.style.cssText = 'font-size: 32px; font-weight: bold; margin: 20px 0 16px 0;';
                        break;
                    case 'heading-two':
                        elem = document.createElement('h2');
                        elem.style.cssText = 'font-size: 24px; font-weight: bold; margin: 16px 0 12px 0;';
                        break;
                    case 'block-quote':
                        elem = document.createElement('blockquote');
                        elem.style.cssText = 'border-left: 4px solid #2196f3; padding-left: 16px; margin: 12px 0; font-style: italic;';
                        break;
                    default:
                        elem = document.createElement('p');
                        elem.style.cssText = 'margin: 0 0 12px 0; line-height: 1.6; font-size: 14px;';
                }

                elem.textContent = nodeText || ' ';
                tempContainer.appendChild(elem);
                const nodeHeight = elem.offsetHeight;

                if (currentHeight + nodeHeight > pageHeight && currentPage.length > 0) {
                    newPages.push(currentPage);
                    currentPage = [node];
                    currentHeight = nodeHeight;
                } else {
                    currentPage.push(node);
                    currentHeight += nodeHeight;
                }
            });

            if (currentPage.length > 0) {
                newPages.push(currentPage);
            }

            document.body.removeChild(tempContainer);

            if (newPages.length === 0 || newPages.every(page => page.length === 0)) {
                newPages.push([{ type: 'paragraph', children: [{ text: '' }] }]);
            }

            setPages(newPages);
            isDistributing.current = false;
        });
    }, []);

    const handleChange = useCallback((value) => {
        setAllContent(value);
        distributeContentToPages(value);
    }, [distributeContentToPages]);

    useEffect(() => {
        distributeContentToPages(allContent);
    }, [allContent, distributeContentToPages]);

    return (
        <div className="document-builder">
            <Toolbar
                toggleFormat={toggleFormat}
                toggleBlock={toggleBlock}
                isFormatActive={isFormatActive}
                isBlockActive={isBlockActive}
                editor={editor}
            />

            <div className="editor-container">
                <div className="editor-panel">
                    <h3>Editor</h3>
                    <div className="editor-content">
                        <Slate
                            editor={editor}
                            initialValue={allContent}
                            onChange={handleChange}
                        >
                            <Editable
                                renderElement={renderElement}
                                renderLeaf={renderLeaf}
                                placeholder="Start typing your document..."
                                spellCheck
                                autoFocus
                            />
                        </Slate>
                    </div>
                </div>

                <div className="preview-panel">
                    <h3>Preview ({pages.length} {pages.length === 1 ? 'page' : 'pages'})</h3>
                    <div className="pages-container" ref={measureRef}>
                        {pages.map((pageContent, index) => (
                            <PagePreview
                                key={`page-${index}`}
                                pageNumber={index + 1}
                                content={pageContent}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PagePreview = ({ pageNumber, content }) => {
    const renderNode = (node, index) => {
        const text = Node.string(node);
        const children = node.children || [];

        // Check for formatting in children
        let formattedText = text;
        if (children.length > 0 && children[0]) {
            const child = children[0];
            let element = <span key={index}>{text || ' '}</span>;

            if (child.bold) {
                element = <strong key={index}>{text}</strong>;
            }
            if (child.italic) {
                element = <em key={index}>{element}</em>;
            }
            if (child.underline) {
                element = <u key={index}>{element}</u>;
            }

            formattedText = element;
        }

        switch (node.type) {
            case 'heading-one':
                return <h1 key={index}>{formattedText}</h1>;
            case 'heading-two':
                return <h2 key={index}>{formattedText}</h2>;
            case 'block-quote':
                return <blockquote key={index}>{formattedText}</blockquote>;
            default:
                return <p key={index}>{formattedText}</p>;
        }
    };

    return (
        <div className="page">
            <div className="page-number">Page {pageNumber}</div>
            <div className="page-content">
                {content.map((node, index) => renderNode(node, index))}
            </div>
        </div>
    );
};

const Toolbar = ({ toggleFormat, toggleBlock, isFormatActive, isBlockActive, editor }) => {
    return (
        <div className="toolbar">
            <button
                className={isFormatActive(editor, 'bold') ? 'active' : ''}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleFormat('bold');
                }}
                title="Bold (Ctrl+B)"
            >
                <strong>B</strong>
            </button>
            <button
                className={isFormatActive(editor, 'italic') ? 'active' : ''}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleFormat('italic');
                }}
                title="Italic (Ctrl+I)"
            >
                <em>I</em>
            </button>
            <button
                className={isFormatActive(editor, 'underline') ? 'active' : ''}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleFormat('underline');
                }}
                title="Underline (Ctrl+U)"
            >
                <u>U</u>
            </button>
            <div className="toolbar-divider"></div>
            <button
                className={isBlockActive(editor, 'heading-one') ? 'active' : ''}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock('heading-one');
                }}
                title="Heading 1"
            >
                H1
            </button>
            <button
                className={isBlockActive(editor, 'heading-two') ? 'active' : ''}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock('heading-two');
                }}
                title="Heading 2"
            >
                H2
            </button>
            <button
                className={isBlockActive(editor, 'block-quote') ? 'active' : ''}
                onMouseDown={(e) => {
                    e.preventDefault();
                    toggleBlock('block-quote');
                }}
                title="Block Quote"
            >
                "
            </button>
        </div>
    );
};

const Element = ({ attributes, children, element }) => {
    switch (element.type) {
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>;
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>;
        case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }
    if (leaf.italic) {
        children = <em>{children}</em>;
    }
    if (leaf.underline) {
        children = <u>{children}</u>;
    }
    return <span {...attributes}>{children}</span>;
};

export default DocumentBuilder;
