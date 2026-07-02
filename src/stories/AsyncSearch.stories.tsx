import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { UncontrolledTreeEnvironment } from '../uncontrolledEnvironment/UncontrolledTreeEnvironment';
import { StaticTreeDataProvider } from '../uncontrolledEnvironment/StaticTreeDataProvider';
import { Tree } from '../tree/Tree';
import { TreeItem, TreeItemIndex } from '../types';

export default {
  title: 'Core/Async Search',
} as Meta;

type ItemData = { title: string; kind: 'category' | 'article' };

// --- A pretend backend -----------------------------------------------------
// The full article set is intentionally NOT part of the tree's data provider:
// only categories are loaded up front; articles live "on the server" and are
// only ever fetched through search. This mirrors the article-picker use case.

const categories: Record<string, string> = {
  'cat-biller-policies': 'BILLER POLICIES - V+R',
  'cat-biller-role': 'BILLER ROLE',
  'cat-capstone': 'CAPSTONE HISTORY',
  'cat-core-model': 'CORE MODEL',
  'cat-emergency': 'EMERGENCY PROCEDURES',
};

const serverArticles: Record<string, string> = {
  'art-1': 'Biller & Coder: Daily Functions Checklist',
  'art-2': 'Biller & Coder: Daily Functions (Formatted)',
  'art-3': 'Vine and Root Biller and Coder Role',
  'art-4': 'Vine and Root Biller and Coder Role (Formatted)',
  'art-5': 'Capstone History Overview',
  'art-6': 'Core Model Foundations',
  'art-7': 'Emergency Evacuation Steps',
};

/** Simulates a debounced backend search over categories + articles. */
const fakeServerSearch = (query: string): Promise<TreeItem<ItemData>[]> => {
  const q = query.toLowerCase();
  const matchedCategories = Object.entries(categories)
    .filter(([, title]) => title.toLowerCase().includes(q))
    .map(
      ([index, title]): TreeItem<ItemData> => ({
        index,
        isFolder: true,
        children: [],
        canMove: false,
        data: { title, kind: 'category' },
      })
    );
  const matchedArticles = Object.entries(serverArticles)
    .filter(([, title]) => title.toLowerCase().includes(q))
    .map(
      ([index, title]): TreeItem<ItemData> => ({
        index,
        isFolder: false,
        data: { title, kind: 'article' },
      })
    );
  return new Promise(resolve => {
    setTimeout(() => resolve([...matchedCategories, ...matchedArticles]), 400);
  });
};

// --- Base (non-search) data: just the categories as folders ----------------

const baseItems: Record<TreeItemIndex, TreeItem<ItemData>> = {
  root: {
    index: 'root',
    isFolder: true,
    children: Object.keys(categories),
    data: { title: 'Articles', kind: 'category' },
  },
  // The "course" the user drags results into.
  'course-root': {
    index: 'course-root',
    isFolder: true,
    children: [],
    data: { title: 'Course', kind: 'category' },
  },
  ...Object.fromEntries(
    Object.entries(categories).map(([index, title]) => [
      index,
      {
        index,
        isFolder: true,
        children: [],
        canMove: false,
        data: { title, kind: 'category' },
      },
    ])
  ),
};

export const AsyncSearchAcrossTrees = () => {
  const [dataProvider] = useState(
    () => new StaticTreeDataProvider<ItemData>(baseItems, (item, data) => ({ ...item, data }))
  );
  const [droppedIntoCourse, setDroppedIntoCourse] = useState<string[]>([]);

  return (
    <>
      <p>
        Type e.g. <strong>&quot;biller&quot;</strong> in the Articles tree. The
        matches are fetched from a (fake) server — matching <em>categories</em>{' '}
        and <em>articles</em> are shown as real tree items. Drag any result into
        the Course tree; nothing was pre-loaded.
      </p>
      <div style={{ display: 'flex', gap: 32 }}>
        <UncontrolledTreeEnvironment<ItemData>
          dataProvider={dataProvider}
          getItemTitle={item => item.data.title}
          canDragAndDrop
          canDropOnFolder
          canReorderItems
          searchDebounce={250}
          onSearch={async (search, treeId) => {
            if (treeId !== 'articles' || !search) return undefined;
            return fakeServerSearch(search);
          }}
          onDrop={(items, target) => {
            if (target.treeId === 'course') {
              setDroppedIntoCourse(prev => [
                ...prev,
                ...items.map(i => i.data.title),
              ]);
            }
          }}
          renderSearchInput={({ inputProps, isSearchLoading }) => (
            <div style={{ position: 'relative' }}>
              <input {...inputProps} placeholder="Search articles & categories…" />
              {isSearchLoading && <span> ⏳</span>}
            </div>
          )}
          renderItemTitle={({ title, item }) => (
            <span>
              {item.data.kind === 'category' ? '📁 ' : '📄 '}
              {title}
            </span>
          )}
          viewState={{ articles: {}, course: {} }}
        >
          <div style={{ minWidth: 320 }}>
            <h4>Articles (async search)</h4>
            <Tree treeId="articles" rootItem="root" treeLabel="Articles" />
          </div>
          <div style={{ minWidth: 320 }}>
            <h4>Course (drop target)</h4>
            <Tree treeId="course" rootItem="course-root" treeLabel="Course" />
            <ul>
              {droppedIntoCourse.map((title, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i}>Dropped: {title}</li>
              ))}
            </ul>
          </div>
        </UncontrolledTreeEnvironment>
      </div>
    </>
  );
};
