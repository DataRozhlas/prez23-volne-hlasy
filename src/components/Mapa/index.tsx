import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://d2tegvb8x5tw12.cloudfront.net/demomap.json";

const Mapa = (props: any) => {
  return (
    <div>
      <ComposableMap
        width={400}
        height={240}
        projection="geoMercator"
        projectionConfig={{
          rotate: [-10.0, -52.0, 0],
          center: [3.55, -2.1],
          scale: 5000,
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => {
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onPointerEnter={() => {
                    props.setTooltipContent(
                      `${geo.properties.ob}, okr. ${geo.properties.ok}`
                    );
                  }}
                  onPointerLeave={() => {
                    props.setTooltipContent(" ");
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export { Mapa };
