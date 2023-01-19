import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RangeSlider, TableHlasy, Tablica } from "../components";
import { tsvParse, dsvFormat } from "d3-dsv";
import { usePostMessageWithHeight } from "../hooks";

const fetchData = async (context: { queryKey: any[] }) => {
  if (context.queryKey[0] === "kandidati") {
    const ssv = dsvFormat(";");
    const urlDetail = `${context.queryKey[1]}/perk.csv`;
    const data = await fetch(`https://data.irozhlas.cz/prez/${urlDetail}`)
      .then(res => res.text())
      .then(res => ssv.parse(res));
    return data;
  }
  if (context.queryKey[0] === "vysledky") {
    const urlDetail = `${context.queryKey[1]}/obce-${context.queryKey[2]}.tsv`;
    const data = await fetch(`https://data.irozhlas.cz/prez/${urlDetail}`)
      .then(res => res.text())
      .then(res => tsvParse(res));
    return data;
  }
};

const addOrRemove = (array: number[], value: number) => {
  const index = array.indexOf(value);
  const newArray = [...array];
  if (index === -1) {
    newArray.push(value);
  } else {
    newArray.splice(index, 1);
  }
  return newArray;
};

const VolneHlasy = () => {
  const [popLimit, setPopLimit] = useState(5000);
  const [finalResult, setFinalResult] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([
    6, 1, 2, 9, 8, 5,
  ]);

  const { containerRef, postHeightMessage } =
    usePostMessageWithHeight("cro-volne-hlasy");

  const candidates = useQuery({
    queryKey: ["kandidati", 2023],
    queryFn: fetchData,
  });

  const results = useQuery({
    queryKey: ["vysledky", 2023, 1],
    queryFn: fetchData,
  });

  const options = [
    { id: 6, name: "Danuše Nerudové", description: "777 022 hlasů" },
    { id: 1, name: "Pavla Fischera", description: "376 705 hlasů" },
    { id: 2, name: "Jaroslava Bašty", description: "248 375 hlasů" },
    { id: 9, name: "Marka Hilšera", description: "142 908 hlasů" },
    { id: 8, name: "Karla Diviše", description: "75 479 hlasů" },
    { id: 5, name: "Tomáše Zimy", description: "30 827 hlasů" },
    { id: 0, name: "Nevoličů", description: "2 667 377 hlasů" },
  ];

  useEffect(() => {
    if (results.data) {
      const volneHlasy: any = results.data
        .filter(obec => Number(obec.ZAPSANI_VOLICI) > popLimit)
        .map(obec => {
          return {
            ...obec,
            result: (function () {
              const candidatesVotes = selectedCandidates.reduce(
                (acc: number, curr: any) => {
                  return acc + Number(obec[`kand-${curr}`]);
                },
                0
              );
              return candidatesVotes;
            })(),
          };
        })
        .sort((a: any, b: any) => b.result - a.result);
      console.log(volneHlasy);
      setFinalResult(volneHlasy);
    }
  }, [results.data, selectedCandidates, popLimit]);

  useEffect(() => {
    postHeightMessage();
  }, [finalResult, postHeightMessage]);

  if (results.isLoading || candidates.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">Stahuji data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white" ref={containerRef}>
      <h1 className="text-2xl font-bold leading-6 pb-2">
        Kde „leží na ulici“ nejvíc volných hlasů?
      </h1>
      <fieldset className="space-y-1">
        <legend className="font-medium text-gray-900">Započítat hlasy</legend>
        {options.map(option => (
          <div key={option.id} className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                id={`person-${option.id}`}
                name={`person-${option.id}`}
                value={option.id}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={selectedCandidates.includes(option.id)}
                onChange={e => {
                  const value = Number(e.target.value);
                  const newSelectedCandidates = addOrRemove(
                    selectedCandidates,
                    value
                  );
                  setSelectedCandidates(newSelectedCandidates);
                }}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor={`person-${option.id}`}
                className="font-medium text-gray-700"
              >
                {option.name}
              </label>
              <span id="comments-description" className="text-gray-500">
                <span className="sr-only">{option.name}</span>
                {` ${option.description}`}
              </span>
            </div>
          </div>
        ))}
      </fieldset>
      <div className="py-6">
        <RangeSlider
          popLimit={popLimit}
          setPopLimit={setPopLimit}
        ></RangeSlider>
      </div>
      <Tablica data={finalResult}></Tablica>
    </div>
  );
};

export default VolneHlasy;
