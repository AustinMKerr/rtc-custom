/* eslint-disable no-await-in-loop */
import { render, act, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  DraggingPosition,
  StaticTreeDataProvider,
  Tree,
  TreeEnvironmentRef,
  TreeItem,
  TreeItemIndex,
  TreeRef,
  UncontrolledTreeEnvironment,
} from '../src';
import {
  computeItemHeight,
  computeItemHeightArray,
  isOutsideOfContainer,
} from '../src/controlledEnvironment/layoutUtils';
import '@testing-library/jest-dom';

jest.mock('../src/controlledEnvironment/layoutUtils');

(computeItemHeight as jest.Mock).mockReturnValue(10);
(isOutsideOfContainer as jest.Mock).mockReturnValue(false);
(computeItemHeightArray as jest.Mock).mockImplementation((treeId: string) =>
  Array.from(
    document.querySelectorAll(
      `[data-rct-tree="${treeId}"] [data-rct-item-container="true"]`
    )
  ).map(() => 10)
);

// Base data: tree-1 shows [base-a, base-b]; tree-2 (drop target) shows [t1].
const buildItems = (): Record<TreeItemIndex, TreeItem<string>> => ({
  root: { index: 'root', isFolder: true, children: ['base-a', 'base-b'], data: 'root' },
  'base-a': { index: 'base-a', data: 'Base A' },
  'base-b': { index: 'base-b', data: 'Base B' },
  root2: { index: 'root2', isFolder: true, children: ['t1'], data: 'root2' },
  t1: { index: 't1', data: 'Target One' },
});

// Server-shaped results: a matching CATEGORY (folder) plus matching ARTICLES,
// none of which exist in the base data provider — exactly the article-picker
// shape from the design.
const searchResultItems: TreeItem<string>[] = [
  { index: 'cat-1', isFolder: true, children: [], data: 'Biller Policies' },
  { index: 'art-1', data: 'Biller Article One' },
  { index: 'art-2', data: 'Biller Article Two' },
];

class Harness {
  environmentRef?: TreeEnvironmentRef | null;

  treeRef?: TreeRef | null;

  renderResult?: ReturnType<typeof render>;

  onDrop = jest.fn();

  dataProvider = new StaticTreeDataProvider(buildItems(), (item, data) => ({
    ...item,
    data,
  }));

  async render(
    onSearch?: (
      search: string | null,
      treeId: string
    ) => Promise<TreeItem[] | void>,
    searchDebounce = 0
  ) {
    await act(async () => {
      this.renderResult = render(
        <UncontrolledTreeEnvironment
          canDragAndDrop
          canDropOnFolder
          canReorderItems
          onSearch={onSearch}
          searchDebounce={searchDebounce}
          onDrop={this.onDrop}
          viewState={{ 'tree-1': {}, 'tree-2': {} }}
          getItemTitle={item => item.data}
          dataProvider={this.dataProvider}
          ref={ref => {
            this.environmentRef = ref;
          }}
          // Plain title renderer so search highlighting doesn't split titles
          // into multiple spans (which would break getByText assertions).
          renderItemTitle={props => props.title}
          renderItem={props => (
            <li
              {...props.context.itemContainerWithChildrenProps}
              style={{ height: 10 }}
              data-testid={`item-container-${props.item.index}`}
            >
              <div {...props.context.itemContainerWithoutChildrenProps}>
                <span
                  {...props.context.interactiveElementProps}
                  data-testid="title"
                >
                  {props.title}
                </span>
              </div>
              <div data-testid="children">{props.children}</div>
            </li>
          )}
        >
          <Tree
            treeId="tree-1"
            rootItem="root"
            treeLabel="tree-1"
            ref={ref => {
              this.treeRef = ref;
            }}
          />
          <Tree treeId="tree-2" rootItem="root2" treeLabel="tree-2" />
        </UncontrolledTreeEnvironment>
      );
    });
    // The data provider loads items asynchronously; the Tree (and thus its ref)
    // only mounts once its root item is available. Wait for that before driving
    // the tree via its ref.
    await act(async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });
    });
    await waitFor(() =>
      expect(this.renderResult!.getByText('Base A')).toBeInTheDocument()
    );
    return this;
  }

  async setSearch(value: string | null) {
    await act(async () => {
      this.treeRef?.setSearch(value);
    });
    // Flush the debounce timer (a macrotask) and then the resolved onSearch
    // promise chain (microtasks).
    await act(async () => {
      await new Promise(resolve => {
        setTimeout(resolve, 5);
      });
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  searchLoading(treeId = 'tree-1') {
    return this.environmentRef?.treeEnvironmentContext.searchLoading?.[treeId];
  }

  containerFor(treeId: string) {
    return document.querySelector(
      `[data-rct-tree="${treeId}"]`
    ) as HTMLElement | null;
  }

  async click(title: string) {
    await act(async () => {
      fireEvent.click(await this.renderResult!.findByText(title));
    });
  }

  async startDrag(title: string) {
    await act(async () => {
      fireEvent.dragStart(await this.renderResult!.findByText(title), {
        dataTransfer: {},
      });
    });
  }

  async dragOverTree(treeId: string, itemIndex: number) {
    await act(async () => {
      this.environmentRef?.dragAndDropContext.onDragOverTreeHandler(
        {
          clientX: 9999,
          clientY: itemIndex * 10 + 5,
        } as any,
        treeId,
        { current: this.containerFor(treeId) ?? undefined }
      );
    });
  }

  async drop() {
    await act(async () => {
      fireEvent.drop(window);
    });
  }
}

describe('async search (onSearch)', () => {
  it('overlays server results as the tree contents and restores on clear', async () => {
    const onSearch = jest.fn(async () => searchResultItems);
    const h = await new Harness().render(onSearch);

    expect(h.renderResult!.getByText('Base A')).toBeInTheDocument();

    await h.setSearch('biller');

    expect(onSearch).toHaveBeenCalledWith('biller', 'tree-1');
    // Results (category + articles) are shown as real items...
    await waitFor(() => {
      expect(h.renderResult!.getByText('Biller Policies')).toBeInTheDocument();
      expect(h.renderResult!.getByText('Biller Article One')).toBeInTheDocument();
      expect(h.renderResult!.getByText('Biller Article Two')).toBeInTheDocument();
    });
    // ...and the base items are replaced for the duration of the search.
    expect(h.renderResult!.queryByText('Base A')).not.toBeInTheDocument();
    // Linear items reflect the overlay (used by keyboard nav + drag).
    expect(
      h.environmentRef!.treeEnvironmentContext.linearItems['tree-1'].map(
        li => li.item
      )
    ).toEqual(['cat-1', 'art-1', 'art-2']);

    // Clearing search restores the normal data-provider view.
    await h.setSearch(null);
    await waitFor(() => {
      expect(h.renderResult!.getByText('Base A')).toBeInTheDocument();
    });
    expect(h.renderResult!.queryByText('Biller Article One')).not.toBeInTheDocument();
  });

  it('exposes an in-flight loading signal while onSearch is pending', async () => {
    let resolveSearch: (items: TreeItem[]) => void = () => undefined;
    const onSearch = jest.fn(
      () =>
        new Promise<TreeItem[]>(resolve => {
          resolveSearch = resolve;
        })
    );
    const h = await new Harness().render(onSearch as any);

    await h.setSearch('biller');
    expect(h.searchLoading('tree-1')).toBe(true);
    expect(h.renderResult!.queryByText('Biller Article One')).not.toBeInTheDocument();

    await act(async () => {
      resolveSearch(searchResultItems);
      await Promise.resolve();
    });

    await waitFor(() => expect(h.searchLoading('tree-1')).toBe(false));
    expect(h.renderResult!.getByText('Biller Article One')).toBeInTheDocument();
  });

  it('a search-result item is draggable out into another tree and fires onDrop', async () => {
    const onSearch = jest.fn(async () => searchResultItems);
    const h = await new Harness().render(onSearch);

    await h.setSearch('biller');
    await waitFor(() =>
      expect(h.renderResult!.getByText('Biller Article One')).toBeInTheDocument()
    );

    await h.click('Biller Article One');
    await h.startDrag('Biller Article One');
    await h.dragOverTree('tree-2', 0);

    // The drag resolved to a position in the *target* tree.
    expect(h.environmentRef!.dragAndDropContext.draggingPosition?.treeId).toBe(
      'tree-2'
    );

    await h.drop();

    expect(h.onDrop).toHaveBeenCalledTimes(1);
    const [droppedItems, target] = h.onDrop.mock.calls[0] as [
      TreeItem[],
      DraggingPosition
    ];
    // The dragged item is the real result item...
    expect(droppedItems.map(i => i.index)).toEqual(['art-1']);
    // ...dropped into the other tree.
    expect(target.treeId).toBe('tree-2');
  });

  it('is backwards compatible: without onSearch, search does not overlay', async () => {
    const h = await new Harness().render(undefined);

    await h.setSearch('biller');

    // No overlay: base items remain, no server results injected.
    expect(h.renderResult!.getByText('Base A')).toBeInTheDocument();
    expect(h.renderResult!.queryByText('Biller Article One')).not.toBeInTheDocument();
    expect(
      h.environmentRef!.treeEnvironmentContext.searchResults['tree-1']
    ).toBeFalsy();
  });
});
