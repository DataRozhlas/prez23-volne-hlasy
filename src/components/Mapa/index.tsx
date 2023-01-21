import { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import geoData from "../../../data/prezmap.json";

//const geoUrl = "https://d2tegvb8x5tw12.cloudfront.net/demomap.json";

const colors = [
  "#ffedea",
  "#ffcec5",
  "#ffad9f",
  "#ff8a75",
  "#ff5533",
  "#e2492d",
  "#be3d26",
  "#9a311f",
  "#782618",
];
const Mapa = (props: any) => {
  const colorScale = scaleQuantile()
    .domain([0, 77])
    .range([0, 1, 2, 3, 4, 5, 6, 7, 8]);

  const countTotal = (selectedCandidates: number[], obec: any) => {
    let total = 0;
    selectedCandidates.forEach((cand: number) => {
      total += obec[`k${cand}`];
    });
    const percent = (total / obec.v) * 100;
    return [total, Math.round(percent)];
  };

  const currentGeoData = useMemo(() => {
    const currentGeometries = geoData.objects.obce.geometries.map(
      (geo: any) => {
        const [total, percent] = countTotal(
          props.selectedCandidates,
          geo.properties
        );
        return {
          ...geo,
          properties: {
            ...geo.properties,
            total,
            percent,
          },
        };
      }
    );
    return {
      ...geoData,
      objects: {
        obce: {
          ...geoData.objects.obce,
          geometries: currentGeometries,
        },
      },
    };
  }, [props.selectedCandidates]);

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
        <Geographies geography={currentGeoData}>
          {({ geographies }) =>
            geographies.map(geo => {
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onPointerEnter={() => {
                    props.setTooltipContent(
                      `${geo.properties.ob}, okr. ${geo.properties.ok}: ${geo.properties.percent} % registrovaných voličů`
                    );
                  }}
                  onPointerLeave={() => {
                    props.setTooltipContent(" ");
                  }}
                  fill={colors[colorScale(geo.properties.percent)] || "#eee"}
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
