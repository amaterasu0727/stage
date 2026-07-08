const CARACTERES_SPECIAUX = '!@#$%^&*';

function genererMotDePasseAleatoire(longueur = 10) {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let resultat = '';
  for (let i = 0; i < longueur; i++) {
    resultat += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return resultat;
}

function ajouterCaractereSpecial(motDePasse) {
  const caractere = CARACTERES_SPECIAUX[Math.floor(Math.random() * CARACTERES_SPECIAUX.length)];
  return motDePasse + caractere;
}

module.exports = { genererMotDePasseAleatoire, ajouterCaractereSpecial };