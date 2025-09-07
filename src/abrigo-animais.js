class AbrigoAnimais {
  constructor() {
    this.animais = {
      Rex: { tipo: 'cão', brinquedos: ['RATO', 'BOLA'] },
      Mimi: { tipo: 'gato', brinquedos: ['BOLA', 'LASER'] },
      Fofo: { tipo: 'gato', brinquedos: ['BOLA', 'RATO', 'LASER'] },
      Zero: { tipo: 'gato', brinquedos: ['RATO', 'BOLA'] },
      Bola: { tipo: 'cão', brinquedos: ['CAIXA', 'NOVELO'] },
      Bebe: { tipo: 'cão', brinquedos: ['LASER', 'RATO', 'BOLA'] },
      Loco: { tipo: 'jabuti', brinquedos: ['SKATE', 'RATO'] }
    };

    this.todosBrinquedos = new Set(
      Object.values(this.animais).flatMap(a => a.brinquedos)
    );
  }

  encontraPessoas(brinquedosPessoa1, brinquedosPessoa2, ordemAnimais) {
    try {
      //preparar dados
      const pessoa1 = this.preparaBrinquedos(brinquedosPessoa1);
      const pessoa2 = this.preparaBrinquedos(brinquedosPessoa2);
      const ordem = this.preparaOrdemAnimais(ordemAnimais);

      //validar entradas
      this.validaBrinquedos(pessoa1);
      this.validaBrinquedos(pessoa2);
      this.validaAnimais(ordem);

      //processar adoção
      const resultado = this.processaAdocoes(pessoa1, pessoa2, ordem);

      return { lista: resultado.sort() };
    } catch (erro) {
      return { erro: erro.message };
    }
  }

  preparaBrinquedos(str) {
    return str.split(',').map(b => b.trim().toUpperCase());
  }

  preparaOrdemAnimais(str) {
    return str.split(',').map(a => a.trim());
  }

  validaBrinquedos(lista) {
    // verificar duplicados
    const brinquedosUnicos = new Set(lista);
    if (brinquedosUnicos.size !== lista.length) {
      throw new Error('Brinquedo inválido');
    }

    // verificar se todos os brinquedos existem em this.todosBrinquedos
    for (const brinquedo of lista) {
      if (!this.todosBrinquedos.has(brinquedo)) {
        throw new Error('Brinquedo inválido');
      }
    }
  }

  validaAnimais(lista) {
    // verificar duplicados
    const animaisUnicos = new Set(lista);
    if (animaisUnicos.size !== lista.length) {
      throw new Error('Animal inválido');
    }

    // verificar se todos os animais existem em this.animais
    for (const animal of lista) {
      if (!this.animais[animal]) {
        throw new Error('Animal inválido');
      }
    }
  }

  processaAdocoes(pessoa1, pessoa2, ordem) {
    let adotadosPessoa1 = [];
    let adotadosPessoa2 = [];
    let resultado = [];

    for (const nomeAnimal of ordem) {
      let dono = this.defineDono(nomeAnimal, pessoa1, pessoa2, adotadosPessoa1, adotadosPessoa2);
      resultado.push(`${nomeAnimal} - ${dono}`);
    }

    return resultado;
  }

  defineDono(nomeAnimal, pessoa1, pessoa2, adotadosPessoa1, adotadosPessoa2) {
    const animal = this.animais[nomeAnimal];
    
    // regra especial do loco: não se importa com ordem se tiver companhia
    if (nomeAnimal === 'Loco') {
      const pessoa1PodeAdotar = adotadosPessoa1.length < 3;
      const pessoa2PodeAdotar = adotadosPessoa2.length < 3;
    
      let pessoa1Atende = false;
      let pessoa2Atende = false;
    
      // Pessoa 1
      if (pessoa1PodeAdotar) {
        if (adotadosPessoa1.length > 0) {
          // já tem companhia → ordem não importa
          pessoa1Atende = this.verificaBrinquedosSemOrdem(animal, pessoa1);
        } else {
          // não tem companhia → precisa da ordem correta
          pessoa1Atende = this.verificaOrdemBrinquedos(animal.brinquedos, pessoa1);
        }
      }
    
      // Pessoa 2
      if (pessoa2PodeAdotar) {
        if (adotadosPessoa2.length > 0) {
          pessoa2Atende = this.verificaBrinquedosSemOrdem(animal, pessoa2);
        } else {
          pessoa2Atende = this.verificaOrdemBrinquedos(animal.brinquedos, pessoa2);
        }
      }
    
      // Decisão final
      if (pessoa1Atende && !pessoa2Atende) {
        adotadosPessoa1.push(nomeAnimal);
        return 'pessoa 1';
      } else if (!pessoa1Atende && pessoa2Atende) {
        adotadosPessoa2.push(nomeAnimal);
        return 'pessoa 2';
      } else {
        return 'abrigo';
      }
    }

    // verificar se cada pessoa pode adotar (limite de 3 animais)
    const pessoa1PodeAdotar = adotadosPessoa1.length < 3;
    const pessoa2PodeAdotar = adotadosPessoa2.length < 3;

    // verificar condições de adoção para cada pessoa
    const pessoa1Atende = pessoa1PodeAdotar && 
                        this.verificaCondicoesAdocao(nomeAnimal, pessoa1) &&
                        this.verificaConflitoGatos(nomeAnimal, adotadosPessoa1);
    
    const pessoa2Atende = pessoa2PodeAdotar && 
                        this.verificaCondicoesAdocao(nomeAnimal, pessoa2) &&
                        this.verificaConflitoGatos(nomeAnimal, adotadosPessoa2);

    // para outros animais (não gatos)
    if (pessoa1Atende && pessoa2Atende) {
      return 'abrigo'; // empate = ninguém fica com o animal
    }
    if (pessoa1Atende) {
      adotadosPessoa1.push(nomeAnimal);
      return 'pessoa 1';
    }
    if (pessoa2Atende) {
      adotadosPessoa2.push(nomeAnimal);
      return 'pessoa 2';
    }
    return 'abrigo';
  }

  verificaCondicoesAdocao(nomeAnimal, brinquedosPessoa) {
    const animal = this.animais[nomeAnimal];
    // regra especial do loco: não se importa com ordem se tiver companhia
    if (nomeAnimal === 'Loco') {
      // se chegou aqui, não tem companhia, então precisa da ordem correta
      return this.verificaOrdemBrinquedos(animal.brinquedos, brinquedosPessoa);
    }

    // para outros animais, verifica ordem dos brinquedos
    return this.verificaOrdemBrinquedos(animal.brinquedos, brinquedosPessoa);
  }

  verificaOrdemBrinquedos(brinquedosAnimal, brinquedosPessoa) {
    let indicePessoa = 0;
    
    for (const brinquedoAnimal of brinquedosAnimal) {
      // procura o brinquedo na lista da pessoa (pode intercalar)
      let encontrou = false;
      while (indicePessoa < brinquedosPessoa.length) {
        if (brinquedosPessoa[indicePessoa] === brinquedoAnimal) {
          encontrou = true;
          indicePessoa++;
          break;
        }
        indicePessoa++;
      }
      
      if (!encontrou) {
        return false; // não encontrou o brinquedo na ordem correta
      }
    }
    
    return true; // todos os brinquedos foram encontrados na ordem correta
  }

  verificaConflitoGatos(nomeAnimalNovo, animaisAdotados) {
    const animalNovo = this.animais[nomeAnimalNovo];
    
    for (const nomeAnimalAdotado of animaisAdotados) {
      const animalAdotado = this.animais[nomeAnimalAdotado];
      
      // se o animal já adotado é um gato, verifica conflito de brinquedos
      if (animalAdotado.tipo === 'gato') {
        const temConflito = animalNovo.brinquedos.some(brinquedo => 
          animalAdotado.brinquedos.includes(brinquedo)
        );
        if (temConflito) {
          return false; // conflito: gato não divide brinquedos
        }
      }
      
      // se o animal novo é um gato, verifica conflito com qualquer animal já adotado
      if (animalNovo.tipo === 'gato') {
        const temConflito = animalNovo.brinquedos.some(brinquedo => 
          animalAdotado.brinquedos.includes(brinquedo)
        );
        if (temConflito) {
          return false; // conflito: gato não divide brinquedos
        }
      }
    }
    
    return true; // sem conflitos
  }

  verificaBrinquedosSemOrdem(animal, brinquedosPessoa) {
    // verifica se a pessoa tem todos os brinquedos necessários (sem ordem)
    return animal.brinquedos.every(brinquedoAnimal => 
      brinquedosPessoa.includes(brinquedoAnimal)
    );
  }
}

export { AbrigoAnimais as AbrigoAnimais };
