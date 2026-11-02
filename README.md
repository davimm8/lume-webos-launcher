# Lume para LG webOS TV

Launcher em português para controle remoto, com os temas Liquid Glass, Costa e Ateliê, biblioteca de aplicativos, entradas da TV, câmeras Agent DVR e galeria Immich.

**[Baixar o aplicativo](downloads/com.lume.launcher_1.0.0_all.ipk)** · **[Instalação em PDF](docs/instalacao.pdf)** · [Guia em LaTeX](docs/instalacao.tex)

A edição pública usa o ID `com.lume.launcher`. O alvo é webOS TV 4.x com Developer Mode. Apps, entradas e pareamento variam por modelo. O botão Home físico continua sob controle do webOS.

## Primeiro uso e privacidade

Os cartões iniciais são sugestões. Em **Demais apps**, atualize a lista e aceite o pareamento na sua TV para descobrir os apps instalados. A lista inicial e a cidade ficam vazias. Em **Preferências → Servidores locais**, configure opcionalmente os endereços do Immich e do Agent DVR. O mosaico aceita até duas câmeras.

Endereços, chaves de API, pareamento e preferências são guardados no armazenamento local do app. Pessoas que usam a TV compartilham o acesso concedido. A troca do endereço do Immich descarta a chave salva. Revogue a chave no Immich para encerrar o acesso. Use HTTPS com certificado aceito pela TV quando disponível. Com HTTP, a chave e o conteúdo trafegam sem criptografia na rede local.

A previsão consulta o Open-Meteo com a pesquisa e as coordenadas da cidade selecionada. O câmbio usa Frankfurter. As recomendações opcionais do Ateliê consultam TMDB com a credencial do usuário. Esses provedores recebem o IP de saída quando consultados. O loopback da descoberta de apps representa a própria TV.

## Reconstrução

Na raiz do repositório, com o perfil TV da webOS CLI, execute `ares-package app service -o downloads`. Créditos dos recursos em [app/CREDITOS.txt](app/CREDITOS.txt) e [app/costa/NOTICES.md](app/costa/NOTICES.md).
