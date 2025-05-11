import React, { useState } from "react";
import { FilterCriteria } from "./types";


interface FilterPanelProps {
  onApply: (criteria: FilterCriteria) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApply }) => {
  const [minRent, setMinRent] = useState<number | "">("");
  const [maxRent, setMaxRent] = useState<number | "">("");
  const [rules, setRules] = useState<string[]>([]);

  const houseRules = ["Pet friendly", "Smoker friendly"];

  const toggleRule = (rule: string) => {
    setRules((prev) => prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]);
  };

  const apply = () => {
    onApply({
      minRent: minRent === "" ? undefined : Number(minRent),
      maxRent: maxRent === "" ? undefined : Number(maxRent),
      rules,
    });
  };

  return (
    <div className="card p-3 mb-4">
      <h5>Filter Options</h5>
      <div className="mb-2">
        <label>Min Rent</label>
        <input type="number" className="form-control" value={minRent} onChange={(e) => setMinRent(e.target.value === "" ? "" : Number(e.target.value))} />
      </div>
      <div className="mb-2">
        <label>Max Rent</label>
        <input
  type="number"
  className="form-control"
  value={maxRent}
  onChange={(e) => setMaxRent(e.target.value === "" ? "" : Number(e.target.value))}
/>
      </div>
      <div className="mb-2">
        <label>House Rules</label>
        <div className="d-flex gap-2 flex-wrap">
          {houseRules.map(rule => (
            <button
              key={rule}
              className={`btn btn-sm ${rules.includes(rule) ? "btn-success" : "btn-outline-success"}`}
              onClick={() => toggleRule(rule)}
            >
              {rules.includes(rule) ? `✓ ${rule}` : rule}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" onClick={apply}>Apply Filters</button>
    </div>
  );
};

export default FilterPanel;
