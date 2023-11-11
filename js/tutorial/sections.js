function register_VIM_TUTORIAL_SECTIONS(interpreter, messager, createSection, registerSection, showCommandOneByOne, doc) {
  var G = VIM_GENERIC;

  var pressEnterToContinue = "Press enter to continue.";

  function showInfo(text) { $('.info').text(text); } //.show(); }

  function sendMessageAsync(message) { setTimeout(function() { messager.sendMessage(message); }, 0); }
  
  function requireEnterToContinue() { showCommandOneByOne(["Enter"], accepterCreator); }
  function waitPressToGotoPractice(waitCode, waitKey) {
      messager.sendMessage('waiting_for_code', { 'end': false, 'code': waitCode });
      var forAbortId = messager.listenTo('pressed_key', function (key) {
        console.log("key", key)
          if (key === waitKey) {
              window.location = 'sandbox.html';
              messager.removeListener('pressed_key', forAbortId);
          }
      });
  }

  function defaultPre() { interpreter.environment.setInsertMode(); }

  function defaultPost() {
    interpreter.environment.setCommandMode();
    showInfo(pressEnterToContinue);
    requireEnterToContinue();
  }

  /** FIXME: should reuse existing code/key functionality */
  var accepterCreator = function(command) {
    var accepter = function(key) {
      if(command === 'ctrl-v') return key === 22 || ($.browser.mozilla && key === 118); //XXX: ugly and don't even work properly
      if(command === "Esc") return key === 27;
      if(command === "Enter") return key === 13;

      var keyAsCode = G.intToChar(key);
      var neededCode = command;
      
      return keyAsCode === neededCode;
    };

    return accepter;
  };

  function cmd(code, postFun) {
      return {
        'code': code,
        'postFun': postFun
      };
    }

    /** TEMPORARY duplication */
    function writeChar(code) {
      var $ch = $(doc.getChar(code));
      $ch.insertBefore($('.cursor'));
    }

    function insertText(text, newline) {
      var mode = interpreter.environment.getMode();

      interpreter.environment.setInsertMode();
      
      newline = newline !== undefined ? newline : true;

      if(newline) {
        interpreter.interpretSequence(["Esc", "o"]);
      }

      var words = text.split(" ");

      G.for_each(words, function(word) {
        //interpreter.interpretSequence(word);
        G.for_each(word, writeChar);
        interpreter.interpretOneCommand("Space");
      });

      interpreter.environment.setMode(mode);
    }

  var introduction_section = createSection("Introduction",
        defaultPre,
    [
        "Olá.",
        "Eu sou um tutorial interativo do |Vim|.",
        "Vou te ensinar sobre o que é o Vim sem complicações. Se estiver com pressa, pressione qualquer tecla para avançar rapidamente.",
        "Para praticar o que aprendeu, experimente a página de |prática|. Ela tem uma referência sensível ao contexto para comandos.",
        "Agora, deixe-me te introduzir aos conceitos básicos do Vim."
    ], defaultPost);

    var two_modes_section = createSection("Two modes, insert and normal",
        defaultPre,
    [
        "O Vim tem dois modos básicos. Um é o modo |inserir|, no qual você escreve texto como se fosse em um editor de texto normal.",
        "O outro é o modo |normal|, que oferece maneiras eficientes de navegar e manipular o texto.",
        "A qualquer momento, você pode ver em qual modo está na barra de status, localizada no topo do editor.",
        "Para mudar entre os modos, use |Esc| para o modo normal e |i| para o modo de inserção.",
        "Vamos tentar! Primeiro, mude para o modo de inserção."
    ],
    function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(
            [
             cmd("i", function() {
               $('.screen_view').addClass('active_context');
               insertText("Ótimo, agora você está no modo de inserção. Escreva algo e depois retorne ao modo normal.");
             }),
             cmd("Esc", function() {
               $('.screen_view').removeClass('active_context');
               interpreter.environment.interpretOneCommand("G");
               insertText("Ótimo. Vamos avançar para outra seção.");
             }),
             "Enter"
            ],
            accepterCreator);
    }
    );

    var basic_movement = createSection("Basic movement: h, j, k, and l",
        defaultPre,
    [
        "Ao contrário do editor de texto comum, você utiliza as teclas |h|, |j|, |k| e |l| em vez das setas do teclado para mover o cursor.",
        "Vamos ver como funciona na prática!"
    ], function() {
        // Precisamos escrever quais as teclas que precisa digitar, ou seja, inserir mais texto nessa parte. Porque antes
        // a teclas que deveriamos digitar apareciam visualmente no teclado, mas ele foi retirado.
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "h", "h", "h", "k", "l", "l", "h", "h", "j",
          cmd("Enter", function() {
            insertText("Vamos seguir em frente.");
          }), "Enter"],
          accepterCreator);
    });

    var word_movement = createSection("Word movement: w, e, b",
        defaultPre,
      [
        "Para navegar pelo texto em termos de palavras, você pode usar as teclas |w|, |b| e |e| (também W, B, E no Vim real).",
        "|w| move para o início da próxima palavra; |e| move para o fim da palavra; e |b| move para o início da palavra."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fn"); // cursor to "begin[n]ing"
        // A mesmo coisa aqui, precisa colocar mais texto já que não vai ter o teclado
        showCommandOneByOne([
          "b", "e", "b", "w", "e", "w", "e", "b",
          cmd("Enter", function() {
            insertText("Ótimo! Vamos seguir em frente.");
          }), "Enter"],
          accepterCreator);
    });

    var times_movement = createSection("Number powered movement, e.g. 5w",
      defaultPre,
      [
          "Mover-se dentro do texto não se limita a teclas individuais; você pode combinar teclas de movimento com um |número|. Por exemplo, |3w| é o mesmo que pressionar w três vezes."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("0");
        showCommandOneByOne(["3", "w", "9", "l", "2", "b",
            cmd("Enter", function() { insertText("Com números, não há entorpecimento.") }),
            "Enter"
        ],
        accepterCreator)
      });

    var times_inserting = createSection("Insert text repeatedly, e.g. 3iYes",
        defaultPre,
        [
            "Você pode inserir texto várias vezes.",
            "Por exemplo, um sublinhado de um cabeçalho pode consistir em 30 |-|s.",
            "------------------------------",
            "Com |30i-| |Esc|, não é necessário pressionar |-| 30 vezes.",
            "Vamos tentar: insira |go| três vezes."
        ],
        function() {
            interpreter.environment.setCommandMode();
            showCommandOneByOne(
                ["3", "i", "g", "o", "Esc",
                cmdWithText("Enter", "Viu? Todo trabalho é apenas pressionar Esc."),
                "Enter"
                ], accepterCreator)
        });

    var find_occurrence = createSection("Find a character, f and F",
        defaultPre,
        [
            "Para encontrar e ir para a próxima (ou anterior) ocorrência de um caractere, use |f| e |F|, por exemplo, |fo| encontra o próximo o.",
            "Você pode combinar f com um número. Por exemplo, você pode encontrar a 3ª ocorrência de 'q' com |3fq|, certo?"
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence("0");
          showCommandOneByOne(["f", "w", "f", "s", "3", "f", "q",
              cmd("Enter", function() { insertText("R-r-ápido!") }),
              "Enter"
          ], accepterCreator)
        });

    var matching_parentheses = createSection("Go to matching parentheses, %",
      defaultPre,
      [
        "Em texto estruturado com parênteses ou colchetes, |(| ou |{| ou |[|, use |%| para pular para o parêntese ou colchete correspondente.",
        "Aqui está um texto (exemplo) para testar isso."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence(["F", "("]);
        showCommandOneByOne(["%", "%", "Enter"], accepterCreator)
      });

    var start_and_end_of_line = createSection("Go to start/end of line, 0 and $",
      defaultPre,
      [
        "Para ir para o início de uma linha, pressione |0|.",
        "Para ir para o fim de uma linha, use |$|"
      ],
      function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(["0", "$", "0", "Enter"], accepterCreator)
      });

    var word_under_cursor = createSection("Find word under cursor, * and #",
      defaultPre,
        [
          "Encontre a próxima ocorrência da palavra sob o cursor com |*|, e a anterior com |#|."
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence(["0", "w"]);
          showCommandOneByOne(["*", "*", "#",
              cmd("#", function() {
                insertText("Nothing new under the cursor.")
              }), "Enter"], accepterCreator)
        });

    var goto_line = createSection("Goto line, g and G",
        defaultPre,
        [
          "|gg| te leva para o início do arquivo; |G| para o final.",
          "Para ir diretamente para uma linha específica, digite seu |número de linha| junto com |G|.",
          "Agora vá para o início desta tela com |gg| e depois volte para o final com |G|."
        ],
        function() {
          interpreter.environment.setCommandMode();
          showCommandOneByOne(["g", "g", "G",
             cmd("Enter", function() {
                 insertText("Vá para a linha 2 com 2G.");
             }),
             "2", "G",
             cmd("Enter", function() {
                insertText("gg! G majorly rocks.")
             }), "Enter"
          ], accepterCreator)
        });

    var search_match = createSection("Search, /text with n and N",
      defaultPre,
      [
        "A busca de texto é uma parte vital de qualquer editor de texto. No Vim, você pressiona |/| e digita o texto que está procurando.",
        "Você pode repetir a busca por ocorrências seguintes e anteriores com |n| e |N|, respectivamente.",
        "Para casos de uso avançados, é possível usar expressões regulares que ajudam a encontrar textos de formatos específicos (no Vim real).",
        "Vamos tentar uma busca simples de texto.",
        "Procure por |texto| e encontre as ocorrências subsequentes com |n|."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("1G");
        showCommandOneByOne(
          ["/", "t", "e", "x", "t", "Enter", "n", "n", "N", "N",
          cmd("Enter",
            function() {
              interpreter.interpretSequence(["/", "Esc"]);
              insertText("Percorra através das agulhas com with /n/e/e/d/l/e/s");
            }),
          "Enter"], accepterCreator
        )
      });

    var removing = createSection("Removing a character, x and X",
        defaultPre,
      [
        "|x| e |X| deletam o caractere abaixo do cursor e à esquerda do cursor, respectivamente",
        "Tente pressionar |x| para remover a última palavra."
      ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "x", "x", "x", "x", "x",
          cmd("x", function() {
             insertText("Às vezes, o tesouro está no indicador (x).");
          }),
            /*
          "X", "X", "X", "X", "X",
          cmd("X", function() {
            //insertText("You removed yourself from this section. Next!");
          }),
          */
          "Enter"],
          accepterCreator);
    });

    var replacing = createSection("Replacing letter under cursor, r",
        defaultPre,
      [
        "Quando você precisa substituir apenas um caractere abaixo do seu cursor, sem mudar para o modo de inserção, use |r|.",
        "Substitua meu"
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fy");
        showCommandOneByOne([
          "r", "e", "Enter"],
          accepterCreator);
    });

    function cmdWithText(command, text) {
        return cmd(command, function() {
                 insertText(text);
               });
    }

    function setActiveContext() { $('.screen_view').addClass('active_context'); }
    function unsetActiveContext() { $('.screen_view').removeClass('active_context'); }

    var adding_line = createSection("Insert new line, o and O",
      defaultPre,
        [
          "Para inserir texto em uma nova linha, pressione |o| ou |O|",
          "Após a nova linha ser criada, o editor é configurado no modo |inserir|.",
          "Escreva um pouco e retorne ao modo |normal|."
        ], function() {
            interpreter.environment.setCommandMode();
            interpreter.interpretSequence(["2", "G"]);
            showCommandOneByOne([
                cmd("o", function() {
                    setActiveContext();
                }),
                cmd("Esc", function() {
                    unsetActiveContext();
                    insertText("Sim! Agora, big O para inserir uma nova linha acima da linha atual.");
                    interpreter.environment.setCommandMode();
                }),
                cmd("O", setActiveContext),
                cmd("Esc",
                    function() {
                        insertText("Aposto que você se sente como O___o");
                        unsetActiveContext();
                    }), "Enter"
            ], accepterCreator)
        });

    var deleting = createSection("Deleting, d",
        defaultPre,
      [
        "|d| é o comando de deletar",
        "Você pode combiná-lo com movimentos, por exemplo, |dw| deleta a primeira palavra à direita do cursor",
        "Também copia o conteúdo, para que você possa colá-lo com |p| em outra localização (no Vim real)."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.environment.interpretOneCommand("0");
        showCommandOneByOne([
          "d", "w",
          cmd("Enter", function() {
            insertText("A palavra se foi. Agora vamos remover duas palavras com d2e.");
            interpreter.environment.interpretSequence(["0"]);
          }),
          "d", "2", "e",
          cmd("Enter", function() {
            insertText("'De' ou não 'de', essa não é mais a pergunta.");
          }), "Enter"],
          accepterCreator);
    });

  var repetition = createSection("Repetition with .",
    defaultPre,
    [
        "Para repetir o comando anterior, basta pressionar |.|",
        "Primeiro, remova duas palavras com |d2w|.",
        "Depois, remova o resto das palavras nesta linha com |.|"
    ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretOneCommand("0");
        showCommandOneByOne([
            "d", "2",
            "w", ".", ".", ".", ".", ".",
          cmd("Enter", function() {
            insertText("Repetição é a raiz de todos os pontos.")
          }),
            "Enter"
        ], accepterCreator)
      });

  var visual_mode = createSection("Visual mode, v",
    defaultPre,
    [
        "Além dos modos de inserção e normal, o Vim também possui o modo |visual|.",
        "No modo visual, você seleciona texto usando teclas de movimento antes de decidir o que fazer com ele.",
        "Vamos ver como. Vá para o modo visual com |v|. Em seguida, selecione uma palavra com |e|. Depois de selecionar o texto, você pode deletá-lo com |d|.",
        "Esta frase não viu a luz."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("4b");
      showCommandOneByOne(
        ["v", "e", "l", "d",
          cmdWithText("Enter", "(Talentoso, não sei mais o que falar)"), "Enter"
        ], accepterCreator)
    });

  var visual_block_mode = createSection("Visual block mode, ctrl-v",
    defaultPre,
    [
      "Há ainda outro modo: |bloco visual|. Isso torna possível inserir texto em várias linhas de uma vez. Vamos ver como com um exemplo de lista.",
      "<> Uma menina esperta",
      "<> Ulisses",
      "<> Aprender e ensinar",
      "Primeiro, mova o cursor para a posição de inserção. Em seguida, pressione |ctrl-v| para entrar no modo de bloco visual. Mova o cursor verticalmente para selecionar linhas. Agora pressione |I|, e adicione texto à área selecionada. |Esc| completa a inserção."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("2G");
      showCommandOneByOne(["l", "ctrl-v", "j", "j", "I", "o", "Esc",
        cmdWithText("Enter", "Os blocos são obstáculos para o progresso."), "Enter"],
        accepterCreator);
    });

  var last_commands = createSection("Real Vim awaits",
        defaultPre,
    [
        "Agora você deve estar bastante confiante para entrar no verdadeiro Vim.",
        "Os comandos mais importantes para lembrar são |:w| (salvar), |:q| (sair) e |:q!| (sair sem salvar).",
        "Além disso, não entre em |PÂNICO!| Se cometer um erro, pressione |u| para desfazer e |ctrl+R| para refazer",
        "Se tiver um problema ou quiser aprender mais sobre o que o Vim oferece, digite |:help|"
      ],
        defaultPost
    );

  var the_end = createSection("The end", defaultPre,
      [
        "Obrigado pelo seu tempo. Espero que tenha gostado.",
        "Pressione |espaço| se quiser testar livremente os comandos no editor de prática.",
        "Tchau!"
      ], () => waitPressToGotoPractice('Space', 32));

  // append a and A
  // J join lines

  /**********************************************
   * Later
   **********************************************/

  // undo
  // change inside parentheses
  // macro

  /**********************************************
   * Register sections
   **********************************************/

    registerSections([
      introduction_section,
      two_modes_section,
      basic_movement,
      word_movement,
      times_movement,
      times_inserting,
      find_occurrence,
      matching_parentheses,
      start_and_end_of_line,
      word_under_cursor,
      goto_line,
      search_match,
      adding_line,
      removing,
      replacing,
      deleting,
      repetition,
      visual_mode,
      //visual_block_mode, // TODO enable when ctrl-v works with most browsers
      last_commands,
      the_end
    ]);

  function registerSections(sections) {
    G.for_each(sections, function(section) {
      registerSection(section);
    });
  }
}
