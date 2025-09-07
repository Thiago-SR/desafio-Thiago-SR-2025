import { AbrigoAnimais } from "./abrigo-animais";

describe('Abrigo de Animais - Testes Completos', () => {

  // ------------------ Validações ------------------
  test('Deve rejeitar animal inválido', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('CAIXA,RATO', 'RATO,BOLA', 'Lulu');
    expect(resultado.erro).toBe('Animal inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Deve rejeitar animal duplicado', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('CAIXA,RATO', 'RATO,BOLA', 'Rex,Rex');
    expect(resultado.erro).toBe('Animal inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Deve rejeitar brinquedo inválido', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('CAIXA,RATO,INVALIDO', 'RATO,BOLA', 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  test('Deve rejeitar brinquedo duplicado', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('CAIXA,RATO,RATO', 'RATO,BOLA', 'Rex');
    expect(resultado.erro).toBe('Brinquedo inválido');
    expect(resultado.lista).toBeFalsy();
  });

  // ------------------ Casos básicos ------------------
  test('Deve encontrar pessoa para um animal simples', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', 'RATO,NOVELO', 'Rex,Fofo');
    expect(resultado.lista.sort()).toEqual(['Fofo - abrigo', 'Rex - pessoa 1'].sort());
    expect(resultado.erro).toBeFalsy();
  });

  test('Deve permitir intercalação de brinquedos', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('LASER,RATO,BOLA', 'RATO,BOLA', 'Bebe');
    expect(resultado.lista[0]).toBe('Bebe - pessoa 1');
    expect(resultado.erro).toBeFalsy();
  });

  test('Deve rejeitar ordem incorreta de brinquedos para gato', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('BOLA,RATO', 'RATO,BOLA', 'Rex');
    expect(resultado.lista[0]).toBe('Rex - pessoa 2');
    expect(resultado.erro).toBeFalsy();
  });

  // ------------------ Limite de 3 animais ------------------
  test('Deve respeitar limite de 3 animais por pessoa', () => {
    const resultado = new AbrigoAnimais().encontraPessoas(
      'RATO,BOLA,LASER,CAIXA,NOVELO,SKATE', 
      'RATO,BOLA,LASER,CAIXA,NOVELO,SKATE', 
      'Rex,Mimi,Fofo,Bola,Bebe,Loco'
    );
    expect(resultado.lista.length).toBe(6);
    const animaisAbrigo = resultado.lista.filter(item => item.includes('abrigo'));
    expect(animaisAbrigo.length).toBeGreaterThan(0);
    expect(resultado.erro).toBeFalsy();
  });

  // ------------------ Regras dos gatos ------------------
  test('Gatos não dividem brinquedos (conflito com outros gatos)', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', 'RATO,BOLA', 'Rex,Zero');
    const animaisAbrigo = resultado.lista.filter(item => item.includes('abrigo'));
    expect(animaisAbrigo.length).toBeGreaterThan(0);
    expect(resultado.erro).toBeFalsy();
  });

  test('Gatos não dividem brinquedos com outros tipos de animais', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA,LASER', 'RATO,BOLA', 'Mimi,Rex');
    expect(resultado.lista.some(item => item.includes('Mimi - pessoa 1'))).toBe(true);
    expect(resultado.lista.some(item => item.includes('Rex - pessoa 2'))).toBe(true);
    expect(resultado.lista.length).toBe(2);
    expect(resultado.erro).toBeFalsy();
  });

  // ------------------ Regras do Loco ------------------
  test('Loco com companhia', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', 'SKATE,RATO', 'Rex,Loco');
    expect(resultado.lista.some(item => item.includes('Loco - pessoa 2'))).toBe(true);
    expect(resultado.lista.some(item => item.includes('Rex - pessoa 1'))).toBe(true);
    expect(resultado.erro).toBeFalsy();
  });

  test('Loco sem companhia', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('SKATE,RATO', 'LASER,BOLA', 'Loco');
    expect(resultado.lista[0]).toBe('Loco - pessoa 1');
    expect(resultado.lista.length).toBe(1);
    expect(resultado.erro).toBeFalsy();
  });

  test('Loco: empate vai para abrigo', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('SKATE,RATO', 'SKATE,RATO', 'Loco');
    expect(resultado.lista[0]).toBe('Loco - abrigo');
    expect(resultado.lista.length).toBe(1);
    expect(resultado.erro).toBeFalsy();
  });

  // ------------------ Empates gerais ------------------
  test('Empate entre pessoas envia animal para abrigo', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA', 'RATO,BOLA', 'Rex');
    expect(resultado.lista[0]).toBe('Rex - abrigo');
    expect(resultado.lista.length).toBe(1);
    expect(resultado.erro).toBeFalsy();
  });

  // ------------------ Ordem alfabética ------------------
  test('Lista de saída deve ser ordenada alfabeticamente', () => {
    const resultado = new AbrigoAnimais().encontraPessoas('RATO,BOLA,LASER,CAIXA,NOVELO,SKATE', 
                                                        'RATO,BOLA,LASER,CAIXA,NOVELO,SKATE', 
                                                        'Fofo,Rex,Bola');
    const nomes = resultado.lista.map(a => a.split(' - ')[0]);
    const nomesOrdenados = [...nomes].sort();
    expect(nomes).toEqual(nomesOrdenados);
  });

});
