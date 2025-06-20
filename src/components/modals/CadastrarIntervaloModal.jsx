import React, { useState, useEffect } from 'react';
import './ModalBase.css';

const CadastrarIntervaloModal = ({ aberto, onCancelar, onSalvar, dia, acompanhantes }) => {
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [nomeSelecionado, setNomeSelecionado] = useState('');
    const [nomesAcompanhantes, setNomesAcompanhantes] = useState([]);

    // Gerar array de horários no formato HH:00
    const horarios = Array.from({ length: 24 }, (_, i) =>
        `${i.toString().padStart(2, '0')}:00`
    );

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

        // Extrai apenas a hora (número) do formato HH:00
        const inicioNum = parseInt(inicio.split(':')[0]);
        const fimNum = parseInt(fim.split(':')[0]);

        if (inicioNum > fimNum) {
            alert('Horário final deve ser após o horário inicial.');
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
                    <label>Hora Início:</label>
                    <select
                        value={inicio}
                        onChange={e => setInicio(e.target.value)}
                        className="combo-box"
                    >
                        <option value="">Selecione...</option>
                        {horarios.map((hora, index) => (
                            <option key={`inicio-${index}`} value={hora}>
                                {hora}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Hora Fim:</label>
                    <select
                        value={fim}
                        onChange={e => setFim(e.target.value)}
                        className="combo-box"
                        disabled={!inicio}
                    >
                        <option value="">Selecione...</option>
                        {horarios
                            .filter(hora => !inicio || hora >= inicio)
                            .map((hora, index) => (
                                <option key={`fim-${index}`} value={hora}>
                                    {hora}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div className="form-group">
                    <label>Acompanhante:</label>
                    <select
                        value={nomeSelecionado}
                        onChange={e => setNomeSelecionado(e.target.value)}
                        className="combo-box"
                    >
                        {nomesAcompanhantes.map((nome, index) => (
                            <option key={`acomp-${index}`} value={nome}>
                                {nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="botoes">
                    <button onClick={onCancelar}>Cancelar</button>
                    <button
                        onClick={handleSalvar}
                        disabled={!inicio || !fim || !nomeSelecionado}
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CadastrarIntervaloModal;