import React, { useState, useEffect } from 'react';
import './ModalBase.css';

const EditarCelulaModal = ({ aberto, onCancelar, onSalvar, dia, hora, acompanhantes, nomeAtual }) => {
    const [nomeSelecionado, setNomeSelecionado] = useState('');
    const [nomesAcompanhantes, setNomesAcompanhantes] = useState([]);

    useEffect(() => {
        if (aberto) {
            if (acompanhantes) {
                const nomes = Object.values(acompanhantes).map(a => a.nome);
                setNomesAcompanhantes(nomes);
                setNomeSelecionado(nomeAtual || '');
            }
        }
    }, [aberto, acompanhantes, nomeAtual]);

    const handleSalvar = () => {
        if (!nomeSelecionado) {
            alert('Selecione um acompanhante.');
            return;
        }
        onSalvar({ dia, hora, nome: nomeSelecionado });
    };

    if (!aberto) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Editar Horário</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {dia} às {hora}
                </p>

                <div className="form-group">
                    <label>Acompanhante:</label>
                    <select
                        value={nomeSelecionado}
                        onChange={e => setNomeSelecionado(e.target.value)}
                        className="combo-box"
                    >
                        <option value="">Selecione...</option>
                        {nomesAcompanhantes.map((nome, index) => (
                            <option key={index} value={nome}>
                                {nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="botoes">
                    <button onClick={onCancelar}>Cancelar</button>
                    <button
                        onClick={handleSalvar}
                        disabled={!nomeSelecionado}
                    >
                        Salvar
                    </button>
                    {nomeAtual && (
                        <button
                            onClick={() => {
                                onSalvar({ dia, hora, nome: '' });
                                onCancelar();
                            }}
                            className="btn-limpar"
                        >
                            Remover
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditarCelulaModal;