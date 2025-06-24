import React from "react";

export type MenuSection =
  | "listings-all"
  | "listings-recommended"
  | "roommates-all"
  | "roommates-recommended";

interface SidebarMenuProps {
  selected: MenuSection;
  onSelect: (section: MenuSection) => void;
  expanded: boolean;
  onToggle: () => void;
}

const sidebarWidth = 220;
const collapsedWidth = 32;

const SidebarMenu: React.FC<SidebarMenuProps> = ({ selected, onSelect, expanded, onToggle }) => (
  <aside
    style={{
      width: expanded ? sidebarWidth : collapsedWidth,
      background: '#f7f7f7',
      borderRight: '1px solid #e0e0e0',
      padding: expanded ? '2rem 1rem' : '0',
      height: '100%',
      boxSizing: 'border-box',
      minHeight: '100%',
      position: 'relative',
      transition: 'width 0.2s cubic-bezier(.4,2,.6,1)',
      overflow: 'hidden',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: expanded ? 'flex-start' : 'center',
      justifyContent: 'flex-start',
    }}
  >
    {/* Bookmark tab (always visible) */}
    {!expanded && (
      <div
        onClick={onToggle}
        style={{
          width: collapsedWidth,
          height: 64,
          background: '#007b8a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          position: 'absolute',
          left: 0,
          top: 32,
          boxShadow: '2px 2px 8px rgba(0,0,0,0.08)',
          zIndex: 20,
        }}
        title="Expand menu"
      >
        <span style={{ fontSize: 22, fontWeight: 700 }}>☰</span>
      </div>
    )}
    {/* Collapse button (inside expanded sidebar) */}
    {expanded && (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: -18,
          top: 24,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: 'none',
          background: '#007b8a',
          color: '#fff',
          fontSize: 18,
          cursor: 'pointer',
          boxShadow: '1px 1px 6px rgba(0,0,0,0.08)',
          zIndex: 30,
        }}
        title="Collapse menu"
      >
        ←
      </button>
    )}
    {/* Sidebar content */}
    {expanded && (
      <nav style={{ width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Listings</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li
              style={{
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: selected === 'listings-all' ? 700 : 400,
                color: selected === 'listings-all' ? '#007b8a' : '#222',
              }}
              onClick={() => onSelect('listings-all')}
            >
              Browse All
            </li>
            <li
              style={{
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: selected === 'listings-recommended' ? 700 : 400,
                color: selected === 'listings-recommended' ? '#007b8a' : '#222',
              }}
              onClick={() => onSelect('listings-recommended')}
            >
              Recommended for you
            </li>
          </ul>
        </div>
        <div style={{ opacity: 0.5 }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Roommates</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '0.5rem 0', cursor: 'not-allowed' }}>Browse All</li>
            <li style={{ padding: '0.5rem 0', cursor: 'not-allowed' }}>Recommended for you <span style={{fontSize: '0.8em', color: '#aaa'}}>*to be implemented*</span></li>
          </ul>
        </div>
      </nav>
    )}
  </aside>
);

export default SidebarMenu; 