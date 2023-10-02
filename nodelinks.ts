import { GraphQueryResult, useAppDispatch, useGraphQueryResult, useML } from '../../data-access/store';
import React, { LegacyRef, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as PIXI from 'pixi.js';
import { GraphType, LinkType, NodeType } from './Types';
import { NLPixi } from './components/NLPixi';
import { getRelatedLinks } from './components/utils';
import { parseQueryResult } from './components/query2NL';
import { processML } from './components/NLMachineLearning';
import { useImmer } from 'use-immer';
import { ML, setShortestPathSource, setShortestPathTarget } from '../../data-access/store/mlSlice';
import { NLPopup } from './components/NLPopup';

interface Props {
  loading?: boolean;
  // currentColours: any;
}

const Div = styled.div`
  background-color: red;
  font: 'Arial';
`;

/** Return default radius */
function Radius() {
  return 1;
}

/** This is the interface of the NodeLinkComponentState. */
export interface NodeLinkComponentState {
  graph: GraphType;
  width: number;
  height: number;
  stage: PIXI.Container;
  links: PIXI.Graphics;
  simulation: d3.Simulation<NodeType, LinkType>;
  myRef: React.RefObject<HTMLDivElement>;
  renderer: PIXI.IRenderer;
  dragOffset: any;
  panOffset: any;
  scalexy: number;
}

export const NodeLinkVis = React.memo((props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useImmer<GraphType | undefined>(undefined);
  const [highlightNodes, setHighlightNodes] = useState<NodeType[]>([]);
  const [highlightedLinks, setHighlightedLinks] = useState<LinkType[]>([]);

  const graphQueryResult = useGraphQueryResult();
  const ml = useML();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (graphQueryResult) {
      console.debug('graphQueryResult', graphQueryResult);

      setGraph(
        parseQueryResult(graphQueryResult, ml, {
          defaultX: (ref.current?.clientWidth || 1000) / 2,
          defaultY: (ref.current?.clientHeight || 1000) / 2,
        })
      );
    }
  }, [graphQueryResult, ml]);

  const onClickedNode = (node: NodeType, ml: ML) => {
    console.log('shortestPath', graph, ml.shortestPath.enabled);

    if (graph) {
      if (ml.shortestPath.enabled) {
        console.log('shortestPath');

        setGraph((draft) => {
          let _node = draft?.nodes.find((n) => n.id === node.id);
          if (!_node) return draft;

          if (!ml.shortestPath.srcNode) {
            _node.isShortestPathSource = true;
            dispatch(setShortestPathSource(node.id));
          } else if (ml.shortestPath.srcNode === node.id) {
            _node.isShortestPathSource = false;
            dispatch(setShortestPathSource(undefined));
          } else if (!ml.shortestPath.trtNode) {
            _node.isShortestPathTarget = true;
            dispatch(setShortestPathTarget(node.id));
          } else if (ml.shortestPath.trtNode === node.id) {
            _node.isShortestPathTarget = false;
            dispatch(setShortestPathTarget(undefined));
          } else {
            _node.isShortestPathSource = true;
            _node.isShortestPathTarget = false;
            dispatch(setShortestPathSource(node.id));
            dispatch(setShortestPathTarget(undefined));
          }
          console.log('shortestPath', _node);
          return draft;
        });
      }
    }
  };

  return (
    <>
      <div className="h-full w-full overflow-hidden" ref={ref}>
        <NLPixi
          graph={graph}
          highlightNodes={highlightNodes}
          highlightedLinks={highlightedLinks}
          onClick={(node, pos) => {
            onClickedNode(node, ml);
          }}
        />

        {/* <VisConfigPanelComponent> */}
        {/* <NodeLinkConfigPanelComponent
               graph={this.state.graph}
               nlViewModel={this.nodeLinkViewModel}
            /> */}
        {/*</VisConfigPanelComponent>*/}
        {/*<VisConfigPanelComponent isLeft>*/}
        {/*  <AttributesConfigPanel nodeLinkViewModel={this.nodeLinkViewModel} />*/}
        {/* </VisConfigPanelComponent> */}
      </div>
    </>
  );
});
NodeLinkVis.displayName = 'NodeLinkVis';

export default NodeLinkVis;
