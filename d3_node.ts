import React, { LegacyRef, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3'

interface Props {
  loading?: boolean;
}

export const NodeLinkVis = React.memo((props: Props) => {

  const ref = useRef(); // hook to store reference to a DOM element

  const [data, setData] = useState([   // to store data related to the vis
    {
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }
  ]);

  useEffect(() => { // create the vis and append it
    
    const svgElement = d3.select(ref.current);
    
    svgElement.append("circle")
      .attr("cx", data[0].x)
      .attr("cy", data[0].y)
      .attr("r",  5)
      .style("fill",  "red");

  }, [data]); // passing data here to dynamically update

  return (
    <div className="svg">
      <svg className="container" 
        ref={ref} width='500' height='500'></svg>
    </div>
  );

});

NodeLinkVis.displayName = 'NodeLinkVis';

export default NodeLinkVis;
