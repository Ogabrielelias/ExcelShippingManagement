import React, { useState } from "react";
import { read, utils, writeFile } from "xlsx";
import "./styles.css";

const defaultInputs = {
    Data_Saida: "",
    Data_Chegada: "",
    Veiculo: "",
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
                    setTravels(rows);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleExport = () => {
        const headings = [
            ["Data_Saida", "Data_Chegada", "Veiculo", "Motorista", "Destino", "Valor"],
        ];
        const newTravels = travels.map((travel) => {
            travel["Data_Chegada"] = travel.Data_Chegada || "----";
            return travel;
        });
        const date = new Date();

        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);
        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, newTravels, { origin: "A2", skipHeader: true });
        utils.book_append_sheet(wb, ws, "Report");
        writeFile(wb, `Lançamento de Viagens ${date.getDate()}-${date.getMonth()}-${date.getFullYear()} .xlsx`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(onEdit){
            setTravels((prev) => {
                prev[editIndex] = inputs;
                return prev;
            });
        }else{
            setTravels((prev) => [...prev, inputs]);
        }
        setInputs(defaultInputs);
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

    const handleEdit = (id)=>{
        setOnEdit(true)
        setEditIndex(id)
        setInputs(travels[id])
    }
    
    return (
        <div className="home-container">
            <h1>Lançamento de Viagens</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="Data_Saida">Data Saida* :</label>
                    <input
                        type="datetime-local"
                        name="Data_Saida"
                        id="Data_Saida"
                        value={inputs.Data_Saida}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Data_Chegada">Data Chegada :</label>
                    <input
                        min={inputs.Data_Saida}
                        type="datetime-local"
                        name="Data_Chegada"
                        id="Data_Chegada"
                        value={inputs.Data_Chegada}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="Veiculo">Veiculo* :</label>
                    <input
                        type="text"
                        name="Veiculo"
                        id="Veiculo"
                        value={inputs.Veiculo}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Motorista">Motorista* :</label>
                    <input
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
                        type="text"
                        name="Destino"
                        id="Destino"
                        value={inputs.Destino}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="Valor">Valor*:</label>
                    <input
                        type="number"
                        step={0.1}
                        name="Valor"
                        id="Valor"
                        value={inputs.Valor}
                        onChange={handleChange}
                        required
                    />
                </div>
                {onEdit ? 
                <>
                    <button className="edit" type="submit">Editar</button>
                    <button className="cancel" onClick={()=>{setInputs(defaultInputs); setOnEdit(false)}}>Cancelar</button>
                </>
                :
                <button type="submit">Registrar</button>}
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
                                    onClick={handleExport}
                                    className="btn btn-primary float-right"
                                >
                                    Exportar Arquivo
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
                                    <th>Data Saida</th>
                                    <th>Data Chegada</th>
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
                                                {new Date(travel.Data_Saida).toLocaleDateString(
                                                    "pt-BR",
                                                    { timeZone: "UTC" }
                                                )}
                                            </td>
                                            <td>
                                                {new Date(travel.Data_Chegada).getMonth()
                                                    ? new Date(
                                                          travel.Data_Chegada
                                                      ).toLocaleDateString("pt-BR", {
                                                          timeZone: "UTC",
                                                      })
                                                    : "--/--/----"}
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
                                        <td colspan="8">Nenhuma Viagem Encontrada.</td>
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