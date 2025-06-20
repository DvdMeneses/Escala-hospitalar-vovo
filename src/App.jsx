import React, { useState, useEffect } from 'react';
import './App.css';
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import html2canvas from 'html2canvas';
import CadastrarIntervaloModal from './components/modals/CadastrarIntervaloModal';
import CadastrarAcompanhanteModal from './components/modals/CadastrarAcompanhanteModal';
import EditarCelulaModal from './components/modals/editarCelulaModal';
const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const horas = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function App() {
  const [escala, setEscala] = useState({});
  const [acompanhantes, setAcompanhantes] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [modalIntervaloAberto, setModalIntervaloAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [modalCelulaAberto, setModalCelulaAberto] = useState(false);
  const [celulaSelecionada, setCelulaSelecionada] = useState({ dia: '', hora: '' });
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    // Carregar escala
    const escalaRef = ref(database, "escala");
    onValue(escalaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setEscala(data);
    });

    // Carregar acompanhantes
    const acompanhantesRef = ref(database, "acompanhantes");
    onValue(acompanhantesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAcompanhantes(data);
    });
  }, []);

  const capitalizarNome = (nome) => {
    return nome
      .trim()
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, letra => letra.toUpperCase());
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

  // Substitua a função salvarEscala por esta:
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

  // Modal handlers
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const abrirModalIntervalo = (dia) => {
    setDiaSelecionado(dia);
    setModalIntervaloAberto(true);
  };

  const fecharModalIntervalo = () => {
    setModalIntervaloAberto(false);
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

  const getCor = (nome) => {
    const encontrados = Object.values(acompanhantes).find(a => a.nome === nome);
    return encontrados?.cor || '#e5e7eb';
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

  return (
    <div className="container">
      <h1>Escala Hospitalar da Vovó</h1>

      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <button onClick={exportarComoImagem} className="btn-exportar">
          📸 Exportar Escala como Imagem
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={abrirModal} className="btn-cadastrar-acompanhante">
          + Cadastrar Acompanhante
        </button>
      </div>

      <div className="tabela-scroll" style={{ overflowX: '50%', width: '100%' }}>
        <table>
          <thead>
            <tr>
              <th>Horário/Dia</th>
              {dias.map(dia => (
                <th key={dia}>
                  {dia}{' '}
                  <button
                    style={{ marginLeft: 8, padding: '2px 6px', fontSize: '0.7rem' }}
                    onClick={() => abrirModalIntervalo(dia)}
                    title={`Cadastrar intervalo de horários para ${dia}`}
                  >
                    + Cadastrar intervalo
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
                        cursor: 'pointer',
                        position: 'relative'
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