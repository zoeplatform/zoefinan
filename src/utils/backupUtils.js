import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Exporta todos os dados do usuário do Firestore para um arquivo JSON.
 * @param {string} uid - O ID do usuário autenticado.
 */
export const exportUserData = async (uid) => {
  try {
    const userRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      throw new Error("Dados do usuário não encontrados.");
    }

    const data = docSnap.data();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `zoefinan_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Erro ao exportar backup:", error);
    throw error;
  }
};

/**
 * Importa dados de um arquivo JSON e atualiza o Firestore do usuário.
 * @param {string} uid - O ID do usuário autenticado.
 * @param {File} file - O arquivo JSON selecionado pelo usuário.
 */
export const importUserData = async (uid, file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Validação básica da estrutura (opcional, mas recomendado)
        if (!importedData || typeof importedData !== 'object') {
          throw new Error("Formato de arquivo inválido.");
        }

        const userRef = doc(db, "usuarios", uid);
        
        // Atualiza o documento do usuário com os dados importados
        // Usamos updateDoc para não sobrescrever campos que podem não estar no backup (como email/UID se forem diferentes)
        // Mas como queremos restaurar "tudo", podemos considerar o que é essencial.
        
        // Limpeza de campos sensíveis ou que não devem ser sobrescritos se necessário
        const { email, criadoEm, ...dataToRestore } = importedData;
        
        await updateDoc(userRef, {
          ...dataToRestore,
          restauradoEm: new Date()
        });

        resolve(true);
      } catch (error) {
        console.error("Erro ao importar backup:", error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsText(file);
  });
};
