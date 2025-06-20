import React, { useState, useEffect } from 'react';
import './App.css';
import { ref, onValue, set } from "firebase/database";
import { database } from "./firebase";
import html2canvas from 'html2canvas';

import CadastrarAcompanhanteModal from './components/CadastrarAcompanhanteModal';

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const horas = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const cores = {
  Naldo: '#1e3a8a',
  Sergio: '#22c55e',
  Edna: '#ec4899',
  Beto: '#f97316',
  Simone: '#06b6d4',
  Kellen: '#8b5cf6',
  Edilene: '#ef4444',
};

function App() {
  const [escala, setEscala] = useState({});
  const [acompanhantes, setAcompanhantes] = useState({});
  const [modalAberto, setModalAberto] = useState(false);

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

  const salvarEscala = (dia, hora) => {
    const nomeDigitado = prompt(`Quem estará disponível em ${dia} às ${hora}?`);
    if (nomeDigitado) {
      const nome = capitalizarNome(nomeDigitado);
      const novaEscala = { ...escala, [`${dia}_${hora}`]: nome };
      setEscala(novaEscala);
      set(ref(database, "escala"), novaEscala);
    }
  };

  const cadastrarIntervalo = (dia) => {
    const intervalo = prompt(`Informe o intervalo para ${dia} no formato HH-HH (ex: 07-18):`);
    if (!intervalo) return;

    const match = intervalo.match(/^(\d{1,2})-(\d{1,2})$/);
    if (!match) {
      alert('Formato inválido. Use HH-HH, ex: 07-18');
      return;
    }

    let [_, inicioStr, fimStr] = match;
    let inicio = parseInt(inicioStr, 10);
    let fim = parseInt(fimStr, 10);

    if (inicio < 0 || inicio > 23 || fim < 0 || fim > 23 || inicio > fim) {
      alert('Intervalo inválido. Horas devem estar entre 0 e 23, e início <= fim.');
      return;
    }

    const nomeDigitado = prompt(`Quem estará disponível em ${dia} das ${inicio.toString().padStart(2, '0')}:00 às ${fim.toString().padStart(2, '0')}:00?`);
    if (!nomeDigitado) return;

    const nome = capitalizarNome(nomeDigitado);

    const novaEscala = { ...escala };
    for (let h = inicio; h <= fim; h++) {
      const horaFormatada = `${h.toString().padStart(2, '0')}:00`;
      novaEscala[`${dia}_${horaFormatada}`] = nome;
    }

    setEscala(novaEscala);
    set(ref(database, "escala"), novaEscala);
  };


  // Modal handlers
  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);


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

      <div className="tabela-scroll">
        <table>
          <thead>
            <tr>
              <th>Horário/Dia</th>
              {dias.map(dia => (
                <th key={dia}>
                  {dia}{' '}
                  <button
                    style={{ marginLeft: 8, padding: '2px 6px', fontSize: '0.7rem' }}
                    onClick={() => cadastrarIntervalo(dia)}
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
                      }}
                      onClick={() => salvarEscala(dia, hora)}
                    >
                      {nome}
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
    </div>
  );
}

export default App;
