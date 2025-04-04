document.addEventListener('DOMContentLoaded', function() {
    // Função para formatar valor para Real brasileiro
    function formatarParaReal(valor) {
        return valor.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    }
    
    // Função para calcular os totais
    function calcularTotais() {
        // Calcular total de receitas
        let totalReceitas = 0;
        document.querySelectorAll('.receita-valor').forEach(function(input) {
            totalReceitas += parseFloat(input.value || 0);
        });
        
        // Calcular total de despesas
        let totalDespesas = 0;
        document.querySelectorAll('.despesa-valor').forEach(function(input) {
            totalDespesas += parseFloat(input.value || 0);
        });
        
        // Calcular saldo
        let saldo = totalReceitas - totalDespesas;
        
        // Atualizar os elementos na página com formatação em Real
        document.getElementById('total-receitas').textContent = formatarParaReal(totalReceitas);
        document.getElementById('total-despesas').textContent = formatarParaReal(totalDespesas);
        document.getElementById('saldo-final').textContent = formatarParaReal(saldo);
        
        // Adicionar classe para destacar saldo negativo
        if (saldo < 0) {
            document.getElementById('saldo-final').style.color = 'red';
        } else {
            document.getElementById('saldo-final').style.color = '';
        }
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        document.getElementById('congregacao').value = '';
        document.getElementById('mes').selectedIndex = 0;
        
        document.querySelectorAll('.receita-valor, .despesa-valor').forEach(function(input) {
            input.value = '';
        });
        
        document.getElementById('total-receitas').textContent = formatarParaReal(0);
        document.getElementById('total-despesas').textContent = formatarParaReal(0);
        document.getElementById('saldo-final').textContent = formatarParaReal(0);
        document.getElementById('saldo-final').style.color = '';
    }
    
    // Função para imprimir o relatório
    function imprimirRelatorio() {
        // Primeiro, calcular os totais para garantir que estão atualizados
        calcularTotais();
        
        // Substituir inputs por textos formatados para impressão
        document.querySelectorAll('.receita-valor, .despesa-valor').forEach(function(input) {
            const value = parseFloat(input.value || 0);
            input.setAttribute('data-value', value);
            input.style.display = 'none';
            
            const textSpan = document.createElement('span');
            textSpan.className = 'print-value';
            textSpan.textContent = formatarParaReal(value);
            input.parentNode.appendChild(textSpan);
        });
        
        // Imprimir a página
        window.print();
        
        // Restaurar os inputs após a impressão
        document.querySelectorAll('.receita-valor, .despesa-valor').forEach(function(input) {
            input.style.display = '';
            const textSpan = input.parentNode.querySelector('.print-value');
            if (textSpan) {
                textSpan.remove();
            }
        });
    }
    
    // Função para salvar dados no localStorage
    function salvarDados() {
        const dados = {
            congregacao: document.getElementById('congregacao').value,
            mes: document.getElementById('mes').value,
            ano: document.getElementById('ano').value,
            receitas: [],
            despesas: []
        };
        
        // Salvar valores de receitas
        document.querySelectorAll('.receita-valor').forEach(function(input, index) {
            dados.receitas.push({
                indice: index + 1,
                valor: parseFloat(input.value || 0)
            });
        });
        
        // Salvar valores de despesas
        document.querySelectorAll('.despesa-valor').forEach(function(input, index) {
            dados.despesas.push({
                indice: index + 1,
                valor: parseFloat(input.value || 0)
            });
        });
        
        // Salvar no localStorage
        const dataHora = new Date().toISOString();
        const chave = `relatorio_${document.getElementById('congregacao').value}_${dataHora}`;
        localStorage.setItem(chave, JSON.stringify(dados));
        
        alert('Dados salvos com sucesso!');
    }
    
    // Função para carregar dados do localStorage
    function carregarDados() {
        // Listar todos os relatórios salvos
        const relatorios = [];
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave.startsWith('relatorio_')) {
                const dados = JSON.parse(localStorage.getItem(chave));
                relatorios.push({
                    chave: chave,
                    congregacao: dados.congregacao,
                    mes: dados.mes,
                    ano: dados.ano
                });
            }
        }
        
        if (relatorios.length === 0) {
            alert('Não há relatórios salvos!');
            return;
        }
        
        // Criar um elemento select para escolher o relatório
        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.padding = '5px';
        select.style.marginBottom = '10px';
        
        relatorios.forEach(function(relatorio) {
            const option = document.createElement('option');
            option.value = relatorio.chave;
            option.textContent = `${relatorio.congregacao} - ${relatorio.mes}/${relatorio.ano}`;
            select.appendChild(option);
        });
        
        // Criar div de diálogo
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'white';
        dialog.style.padding = '20px';
        dialog.style.border = '1px solid #ccc';
        dialog.style.borderRadius = '5px';
        dialog.style.zIndex = '1000';
        dialog.style.width = '300px';
        
        const title = document.createElement('h3');
        title.textContent = 'Selecione um relatório para carregar:';
        title.style.marginTop = '0';
        
        const btnCarregar = document.createElement('button');
        btnCarregar.textContent = 'Carregar';
        btnCarregar.className = 'btn';
        btnCarregar.style.marginRight = '10px';
        
        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.className = 'btn';
        
        const buttonDiv = document.createElement('div');
        buttonDiv.style.textAlign = 'center';
        buttonDiv.appendChild(btnCarregar);
        buttonDiv.appendChild(btnCancelar);
        
        dialog.appendChild(title);
        dialog.appendChild(select);
        dialog.appendChild(buttonDiv);
        
        // Adicionar overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        // Event listener para o botão carregar
        btnCarregar.addEventListener('click', function() {
            const chave = select.value;
            const dados = JSON.parse(localStorage.getItem(chave));
            
            // Preencher os campos do formulário
            document.getElementById('congregacao').value = dados.congregacao;
            document.getElementById('mes').value = dados.mes;
            document.getElementById('ano').value = dados.ano;
            
            // Preencher valores de receitas
            document.querySelectorAll('.receita-valor').forEach(function(input, index) {
                if (dados.receitas[index]) {
                    input.value = dados.receitas[index].valor;
                } else {
                    input.value = '';
                }
            });
            
            // Preencher valores de despesas
            document.querySelectorAll('.despesa-valor').forEach(function(input, index) {
                if (dados.despesas[index]) {
                    input.value = dados.despesas[index].valor;
                } else {
                    input.value = '';
                }
            });
            
            // Calcular totais
            calcularTotais();
            
            // Remover o diálogo e overlay
            document.body.removeChild(dialog);
            document.body.removeChild(overlay);
        });
        
        // Event listener para o botão cancelar
        btnCancelar.addEventListener('click', function() {
            document.body.removeChild(dialog);
            document.body.removeChild(overlay);
        });
    }
    
    // Adicionar event listeners aos botões
    document.getElementById('btn-calcular').addEventListener('click', calcularTotais);
    document.getElementById('btn-limpar').addEventListener('click', limparFormulario);
    document.getElementById('btn-imprimir').addEventListener('click', imprimirRelatorio);
    document.getElementById('btn-salvar').addEventListener('click', salvarDados);
    document.getElementById('btn-carregar').addEventListener('click', carregarDados);
    
    // Adicionar event listeners a todos os inputs para calcular automaticamente quando valores mudarem
    document.querySelectorAll('.receita-valor, .despesa-valor').forEach(function(input) {
        input.addEventListener('change', calcularTotais);
        input.addEventListener('input', calcularTotais);
    });
    
    // Preencher o ano atual automaticamente
    const dataAtual = new Date();
    document.getElementById('ano').value = dataAtual.getFullYear();
    
    // Inicializar os totais formatados em Real
    document.getElementById('total-receitas').textContent = formatarParaReal(0);
    document.getElementById('total-despesas').textContent = formatarParaReal(0);
    document.getElementById('saldo-final').textContent = formatarParaReal(0);
});