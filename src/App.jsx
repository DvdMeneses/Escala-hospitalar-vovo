import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import html2canvas from 'html2canvas';

import CadastrarIntervaloModal from './components/modals/CadastrarIntervaloModal';
import CadastrarAcompanhanteModal from './components/modals/CadastrarAcompanhanteModal';
import EditarCelulaModal from './components/modals/editarCelulaModal';

// CONSTANTES
const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const horas = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

// COMPONENTE PRINCIPAL
function App() {
  // STATES
  const [escala, setEscala] = useState({});
  const [acompanhantes, setAcompanhantes] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [modalIntervaloAberto, setModalIntervaloAberto] = useState(false);
  const [modalCelulaAberto, setModalCelulaAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [celulaSelecionada, setCelulaSelecionada] = useState({ dia: '', hora: '' });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [exportando, setExportando] = useState(false);

  const tabelaRef = useRef(null);

  // EFFECTS
  useEffect(() => {
    onValue(ref(database, "escala"), (snapshot) => {
      const data = snapshot.val();
      if (data) setEscala(data);
    });

    onValue(ref(database, "acompanhantes"), (snapshot) => {
      const data = snapshot.val() || {};
      setAcompanhantes(data);
    });
  }, []);

  // FUNÇÕES AUXILIARES
  const capitalizarNome = (nome) =>
    nome.trim().toLowerCase().replace(/(?:^|\s)\S/g, letra => letra.toUpperCase());

  const getCor = (nome) => {
    const encontrado = Object.values(acompanhantes).find(a => a.nome === nome);
    return encontrado?.cor || '#e5e7eb';
  };

  const exportarComoImagem = () => {
    const tabela = document.querySelector('.tabela-scroll');
    if (!tabela) return;

    html2canvas(tabela, {
      scale: 2,
      backgroundColor: '#ffffff',
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'escala-vovo.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // FUNÇÕES DE AÇÃO
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const abrirModalIntervalo = (dia) => {
    setDiaSelecionado(dia);
    setModalIntervaloAberto(true);
  };

  const fecharModalIntervalo = () => setModalIntervaloAberto(false);

  const abrirModalCelula = (dia, hora) => {
    setCelulaSelecionada({ dia, hora });
    setModalCelulaAberto(true);
  };

  const salvarCelula = ({ dia, hora, nome }) => {
    const novaEscala = { ...escala, [`${dia}_${hora}`]: nome };
    setEscala(novaEscala);
    set(ref(database, "escala"), novaEscala);
    setModalCelulaAberto(false);
  };

  const salvarIntervalo = ({ dia, inicio, fim, nome }) => {
    const nomeCapitalizado = capitalizarNome(nome);
    const novaEscala = { ...escala };

    for (let h = inicio; h <= fim; h++) {
      const horaFormatada = `${h.toString().padStart(2, '0')}:00`;
      novaEscala[`${dia}_${horaFormatada}`] = nomeCapitalizado;
    }

    setEscala(novaEscala);
    set(ref(database, "escala"), novaEscala);
    fecharModalIntervalo();
  };

  const salvarAcompanhante = ({ nome, cor }) => {
    const nomeJaExiste = Object.values(acompanhantes).some((a) => a.nome === nome);
    if (nomeJaExiste) {
      alert('Já existe um acompanhante com esse nome.');
      return;
    }

    const novoId = Date.now().toString();
    const novoAcompanhante = { id: novoId, nome, cor };

    set(ref(database, `acompanhantes/${novoId}`), novoAcompanhante)
      .then(() => fecharModal())
      .catch(error => alert('Erro ao salvar acompanhante: ' + error.message));
  };

  const removerAcompanhante = (dia, hora) => {
    const novaEscala = { ...escala };
    delete novaEscala[`${dia}_${hora}`];
    setEscala(novaEscala);
    set(ref(database, "escala"), novaEscala);
    setHoveredCell(null);
  };

  // JSX
  return (
    <div className="container">
      <h1>Escala Hospitalar da Vovó</h1>

      <div className="action-buttons">
        <button onClick={exportarComoImagem} className="btn-actions" disabled={exportando}>
          {exportando ? 'Gerando Imagem...' : '📷 Exportar como Imagem'}
        </button>
      </div>

      <div className="action-buttons">
        <button onClick={abrirModal} className="btn-actions">
          Cadastrar Acompanhante
        </button>
      </div>

      <div className="tabela-scroll" ref={tabelaRef}>
        <table>
          <thead>
            <tr>
              <th>Horário/Dia</th>
              {dias.map(dia => (
                <th key={dia}>
                  {dia}
                  <button
                    className="btn-intervalo"
                    onClick={() => abrirModalIntervalo(dia)}
                    title={`Cadastrar intervalo de horários para ${dia}`}
                  >
                    Cadastrar intervalo
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horas.map(hora => (
              <tr key={hora}>
                <td className="hora">{hora}</td>
                {dias.map(dia => {
                  const key = `${dia}_${hora}`;
                  const nome = escala[key] || '';
                  return (
                    <td
                      key={key}
                      style={{
                        backgroundColor: nome ? getCor(nome) : '#fff',
                        color: nome ? '#fff' : '#000',
                      }}
                      onClick={() => abrirModalCelula(dia, hora)}
                      onMouseEnter={() => setHoveredCell(nome ? key : null)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {nome}
                      {hoveredCell === key && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removerAcompanhante(dia, hora);
                          }}
                          className="btn-remover"
                          title="Remover acompanhante"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAIS */}
      <CadastrarAcompanhanteModal
        aberto={modalAberto}
        onCancelar={fecharModal}
        onSalvar={salvarAcompanhante}
      />

      <CadastrarIntervaloModal
        aberto={modalIntervaloAberto}
        onCancelar={fecharModalIntervalo}
        onSalvar={salvarIntervalo}
        dia={diaSelecionado}
        acompanhantes={acompanhantes}
      />

      <EditarCelulaModal
        aberto={modalCelulaAberto}
        onCancelar={() => setModalCelulaAberto(false)}
        onSalvar={salvarCelula}
        dia={celulaSelecionada.dia}
        hora={celulaSelecionada.hora}
        acompanhantes={acompanhantes}
        nomeAtual={escala[`${celulaSelecionada.dia}_${celulaSelecionada.hora}`] || ''}
      />
    </div>
  );
}

export default App;