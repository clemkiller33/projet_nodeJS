import fs from "node:fs/promises";
import path from "path";

// On ignore ces fichiers/dossiers
const IGNORE = [
  "node_modules",
  ".git",
  "package.json",
  "package-lock.json",
  "output.txt",
];

/**
 * Lit de manière récursive le dossier et remplit deux tableaux :
 * - structureLines : pour l’arborescence simple
 * - fullLines : pour l’arborescence + contenu des fichiers
 */
async function parcourirDossier(ignoreList, directory = ".", indent = 0, structureLines = [], fullLines = []) {
  const files = await fs.readdir(directory);
  files.sort(); 
  const indentation = "   ".repeat(indent);

  for (const file of files) {
    // On ignore ce qui est dans la liste
    if (ignoreList.includes(file)) continue;

    const currentPath = path.join(directory, file);
    const stats = await fs.stat(currentPath);

    if (stats.isDirectory()) {
      // On ajoute le dossier dans les deux tableaux (structure et complet)
      structureLines.push(`${indentation}📂 ${file}`);
      fullLines.push(`${indentation}📂 ${file}`);
      
      // récursif
      await parcourirDossier(ignoreList, currentPath, indent + 1, structureLines, fullLines);
      
    } else if (stats.isFile()) {
      // On ajoute le fichier dans l’arborescence
      structureLines.push(`${indentation}📄 ${file}`);
      fullLines.push(`${indentation}📄 ${file}`);

      // lit son contenu pour l’ajouter dans la version complète
      try {
        const data = await fs.readFile(currentPath, "utf8");
        // petit décalage
        const contentIndent = "   ".repeat(indent + 1);
        
        fullLines.push(`${contentIndent}Chemin : ${currentPath}`);
        fullLines.push(`${contentIndent}Contenu :\n${data}`);
      } catch (error) {
        fullLines.push(`   Erreur de lecture du fichier : ${currentPath}`);
      }

      fullLines.push("");
    }
  }

  // On retourne les deux tableaux pour qu’ils puissent être récupérés
  return { structureLines, fullLines };
}

async function main() {
  try {
    let structureLines = [];
    let fullLines = [];

    // On lance la lecture
    const { structureLines: s, fullLines: f } = await parcourirDossier(IGNORE, ".", 0, structureLines, fullLines);
    
    // On met à jour nos tableaux finaux
    structureLines = s;
    fullLines = f;

    // --- 1) Affichage uniquement de l'arborescence dans la console ---
    console.log("ARBORESCENCE DU DOSSIER :");
    console.log(structureLines.join("\n"));

    // --- 2) Écriture de l’arborescence + contenu des fichiers dans 'output.txt' ---
    const finalOutput = fullLines.join("\n");
    await fs.writeFile("output.txt", finalOutput, "utf8");
    console.log("\nContenu complet (arbo + fichiers) enregistré dans 'output.txt'.");
    
  } catch (error) {
    console.error("Erreur :", error);
  }
}

main();
