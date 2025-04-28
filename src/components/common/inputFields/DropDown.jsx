import { Select } from "antd";

function Dropdown({ options, selectedValue, onChange }) {

    return (
        <div>
            <Select
                showSearch
                placeholder="Select Document Type"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().startsWith(input.toLowerCase())
                }
                options={options}
                value={selectedValue}
                onSelect={(value) => { onChange(value) }}
                className="w-full mt-3 text-sm"
            />
        </div>
    );
};

export default Dropdown