import React, { useState } from "react";
import { read, utils, writeFile } from "xlsx";
import "./styles.css";

const vehicles = ["HR", "Courie", "Saveiro", "710"];

const defaultInputs = {
    Data_Entrega: "",
    Veiculo: vehicles[0],
    Motorista: "",
    Destino: "",
    Valor: "",
};

const Home = () => {
    const [travels, setTravels] = useState([]);
    const [inputs, setInputs] = useState(defaultInputs);
    const [onEdit, setOnEdit] = useState(false);
    const [editIndex, setEditIndex] = useState();

    let CurrencyFormat = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    function FormataStringData(data) {
        var dia = data.split("/")[0];
        var mes = data.split("/")[1];
        var ano = data.split("/")[2];

        return ano + "-" + ("0" + mes).slice(-2) + "-" + ("0" + dia).slice(-2);
    }

    const handleImport = ($event) => {
        const files = $event.target.files;
        if (files.length) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;

                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]], { raw: false });
                    let newRows = rows.map((row) => {
                        row["Data_Entrega"] = FormataStringData(row.Data_Entrega);
                        return row;
                    });
                    setTravels(newRows);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleExport = () => {
        const headings = [["Data_Entrega", "Veiculo", "Motorista", "Destino", "Valor"]];

        const newTravels = travels.map((travel) => {
            let dtEntrega = travel.Data_Entrega;
            if (travel.Data_Entrega.includes("-")) {
                travel["Data_Entrega"] = new Date(dtEntrega).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                });
            }
            return travel;
        });

        const date = new Date();

        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);
        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, newTravels, { origin: "A2", skipHeader: true });
        utils.book_append_sheet(wb, ws, "Report");
        writeFile(
            wb,
            `Lançamento de Viagens ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}.xlsx`
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (onEdit) {
            setTravels((prev) => {
                prev[editIndex] = inputs;

                prev.map((travel) => {
                    let dtEntrega = travel.Data_Entrega;
                    if (travel.Data_Entrega.includes("/")) {
                        travel["Data_Entrega"] = FormataStringData(dtEntrega);
                    }
                    return travel;
                });
                return prev;
            });
        } else {
            setTravels((prev) => {
                prev.map((travel) => {
                    let dtEntrega = travel.Data_Entrega;
                    if (travel.Data_Entrega.includes("/")) {
                        travel["Data_Entrega"] = FormataStringData(dtEntrega);
                    }
                    return travel;
                });

                return [...prev, inputs];
            });
        }
        setInputs((prev) => {
            return { ...defaultInputs, Data_Entrega: prev.Data_Entrega };
        });
        setOnEdit(false);
    };

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const handleDelete = (id) => {
        let newData = travels.filter((_, index) => index !== id);
        setTravels(newData);
    };

    const handleEdit = (id) => {
        setOnEdit(true);
        setEditIndex(id);
        setInputs(travels[id]);
    };

    return (
        <div className="home-container">
            <h1>Lançamento de Viagens</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="Data_Entrega">Data Entrega* :</label>
                    <input
                        type="date"
                        name="Data_Entrega"
                        id="Data_Entrega"
                        value={inputs.Data_Entrega}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Veiculo">Veiculo* :</label>
                    <select
                        onChange={handleChange}
                        value={inputs.Veiculo}
                        name="Veiculo"
                        id="Veiculo"
                    >
                        {vehicles.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                    {/* <input
                        minLength={1}
                        type="text"
                        name="Veiculo"
                        id="Veiculo"
                        value={inputs.Veiculo}
                        onChange={handleChange}
                        required
                    /> */}
                </div>
                <div>
                    <label htmlFor="Motorista">Motorista* :</label>
                    <input
                        minLength={2}
                        type="text"
                        name="Motorista"
                        id="Motorista"
                        value={inputs.Motorista}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Destino">Destino* :</label>
                    <input
                        minLength={1}
                        type="text"
                        name="Destino"
                        id="Destino"
                        value={inputs.Destino}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Valor">Valor* :</label>
                    <input
                        type="number"
                        step={0.1}
                        min={0}
                        name="Valor"
                        id="Valor"
                        value={inputs.Valor}
                        onChange={handleChange}
                        required
                    />
                </div>
                {onEdit ? (
                    <>
                        <button className="edit main-btn" type="submit">
                            Editar
                        </button>
                        <button
                            className="cancel"
                            onClick={() => {
                                setInputs((prev) => {
                                    return { ...defaultInputs, Data_Entrega: prev.Data_Entrega };
                                });
                                setOnEdit(false);
                            }}
                        >
                            Cancelar
                        </button>
                    </>
                ) : (
                    <button className="main-btn" type="submit">
                        Registrar
                    </button>
                )}
            </form>
            <div className="excel-table">
                <div>
                    <div>
                        <div className="input-group">
                            <div>
                                <div>
                                    <div className="custom-file">
                                        <input
                                            type="file"
                                            name="file"
                                            className="custom-file-input"
                                            id="inputGroupFile"
                                            required
                                            onChange={handleImport}
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        />
                                        <label
                                            className="custom-file-label"
                                            htmlFor="inputGroupFile"
                                        >
                                            Importar Arquivo
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    className="btn btn-primary float-right"
                                >
                                    Salvar Arquivo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Data Entrega</th>
                                <th>Veículo</th>
                                <th>Motorista</th>
                                <th>Destino</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {travels.length ? (
                                travels.map((travel, index) => (
                                    <tr key={index}>
                                        <th>{index}</th>
                                        <td>
                                            {new Date(travel.Data_Entrega).toLocaleDateString(
                                                "pt-BR",
                                                { timeZone: "UTC" }
                                            )}
                                        </td>
                                        <td>{travel.Veiculo}</td>
                                        <td>{travel.Motorista}</td>
                                        <td>{travel.Destino}</td>
                                        <td>
                                            <span>{CurrencyFormat.format(travel.Valor)}</span>
                                        </td>
                                        <td className="actions">
                                            <a className="edit" onClick={() => handleEdit(index)}>
                                                Editar
                                            </a>
                                            <a
                                                className="delete"
                                                onClick={() => handleDelete(index)}
                                            >
                                                Excluir
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">Nenhuma Viagem Encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Home;
