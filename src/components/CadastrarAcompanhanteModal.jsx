import React, { useState } from 'react';
import './CadastrarAcompanhanteModal.css';

export default function CadastrarAcompanhanteModal({ aberto, onCancelar, onSalvar }) {
    const [nome, setNome] = useState('');

    const capitalizarNome = (nome) => {
        return nome.trim().toLowerCase().replace(/(?:^|\s)\S/g, l => l.toUpperCase());
    };

    const gerarCorAleatoriaValida = () => {
        const coresProibidas = ['#ffffff', '#000000', '#808080'];
        let cor;
        do {
            cor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        } while (coresProibidas.includes(cor.toLowerCase()));
        return cor;
    };

    const handleSalvar = () => {
        if (!nome.trim()) {
            alert('Digite um nome válido');
            return;
        }
        const nomeFormatado = capitalizarNome(nome);
        const cor = gerarCorAleatoriaValida();
        onSalvar({ nome: nomeFormatado, cor });
        setNome('');
    };

    if (!aberto) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Cadastrar Acompanhante</h2>
                <input
                    type="text"
                    placeholder="Nome do acompanhante"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
                <div className="botoes">
                    <button onClick={() => { setNome(''); onCancelar(); }}>Cancelar</button>
                    <button onClick={handleSalvar}>Salvar</button>
                </div>
            </div>
        </div>
    );
}
