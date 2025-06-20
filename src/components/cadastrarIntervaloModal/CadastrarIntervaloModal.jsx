import React, { useState, useEffect } from 'react';
import '../cadastrarAcompanhante/CadastrarAcompanhanteModal.css';

const CadastrarIntervaloModal = ({ aberto, onCancelar, onSalvar, dia, acompanhantes }) => {
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [nomeSelecionado, setNomeSelecionado] = useState('');
    const [nomesAcompanhantes, setNomesAcompanhantes] = useState([]);

    useEffect(() => {
        if (aberto) {
            setInicio('');
            setFim('');
            setNomeSelecionado('');

            if (acompanhantes) {
                const nomes = Object.values(acompanhantes).map(a => a.nome);
                setNomesAcompanhantes(nomes);
                if (nomes.length > 0) {
                    setNomeSelecionado(nomes[0]);
                }
            }
        }
    }, [aberto, acompanhantes]);

    const handleSalvar = () => {
        if (!inicio || !fim || !nomeSelecionado) {
            alert('Preencha todos os campos.');
            return;
        }

        const inicioNum = parseInt(inicio);
        const fimNum = parseInt(fim);

        if (isNaN(inicioNum) || isNaN(fimNum) ||
            inicioNum < 0 || fimNum > 23 || inicioNum > fimNum) {
            alert('Intervalo inválido. Use horas entre 0 e 23, com início <= fim.');
            return;
        }

        onSalvar({ dia, inicio: inicioNum, fim: fimNum, nome: nomeSelecionado });
    };

    if (!aberto) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Cadastrar Intervalo</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Para o dia <strong>{dia}</strong>
                </p>

                <div className="form-group">
                    <label>Hora Início (0 a 23):</label>
                    <input
                        type="number"
                        value={inicio}
                        onChange={e => setInicio(e.target.value)}
                        min="0"
                        max="23"
                        placeholder="Ex: 7"
                    />
                </div>

                <div className="form-group">
                    <label>Hora Fim (0 a 23):</label>
                    <input
                        type="number"
                        value={fim}
                        onChange={e => setFim(e.target.value)}
                        min="0"
                        max="23"
                        placeholder="Ex: 18"
                    />
                </div>

                <div className="form-group">
                    <label>Nome do Acompanhante:</label>
                    <select
                        value={nomeSelecionado}
                        onChange={e => setNomeSelecionado(e.target.value)}
                        className="combo-box"
                    >
                        {nomesAcompanhantes.map((nome, index) => (
                            <option key={index} value={nome}>
                                {nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="botoes">
                    <button onClick={onCancelar}>Cancelar</button>
                    <button onClick={handleSalvar}>Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default CadastrarIntervaloModal;