# 🧪 Test des Erreurs Supabase Storage

## ✅ **Solution implémentée**

### **Problème résolu :**

Les erreurs Supabase Storage (403 Unauthorized, RLS policy violations) n'étaient pas affichées dans l'interface utilisateur car elles étaient capturées et transformées en images de fallback sans remonter au store.

### **Architecture de la solution :**

```typescript
// 1️⃣ Infrastructure : Système de warnings
interface WarningCallback {
  (message: string): void;
}

// 2️⃣ Store : Configuration du callback
infra.setWarningCallback((message: string) => {
  addError(`⚠️ ${message}`);
});

// 3️⃣ UI : Affichage des warnings comme erreurs
store.error() → mat-chip-set → Interface utilisateur
```

## 🔧 **Implémentation détaillée**

### **1. Infrastructure (`infrastructure.ts`)**

#### **Système de warnings :**

```typescript
private warningCallback?: (message: string) => void;

setWarningCallback(callback: (message: string) => void) {
  this.warningCallback = callback;
}

private signalWarning(message: string) {
  if (this.warningCallback) {
    this.warningCallback(message);
  }
}
```

#### **Gestion d'erreur Supabase avec fallback :**

```typescript
} catch (uploadError) {
  const errorMessage = `Erreur Supabase Storage: ${uploadError.message} - Image par défaut utilisée`;
  this.loggingService.error('INFRASTRUCTURE', '🚫 Erreur upload Supabase Storage', { postId, error: uploadError });
  this.signalWarning(errorMessage); // ✅ Remonte dans le store
  return 'https://via.placeholder.com/800x400/4caf50/white?text=Image+Non+Disponible'; // ✅ Fallback
}
```

### **2. Store (`store/index.ts`)**

#### **Configuration du callback :**

```typescript
// Configurer le callback pour les warnings de l'Infrastructure
infra.setWarningCallback((message: string) => {
  loggingService.warn("STORE", "⚠️ Warning depuis Infrastructure", { message });
  addError(`⚠️ ${message}`); // ✅ Ajoute le warning comme erreur dans l'UI
});
```

### **3. Interface utilisateur**

#### **Affichage cohérent :**

- ✅ **Erreurs critiques** : Affichées avec icône `error`
- ✅ **Warnings** : Affichées avec préfixe `⚠️`
- ✅ **Fallbacks** : Application continue à fonctionner
- ✅ **Fermeture** : Bouton pour nettoyer les messages

## 🧪 **Tests disponibles**

### **1. Test d'erreur générique :**

- **Bouton** : "🐛 Test Erreur"
- **Action** : Déclenche une erreur dans Infrastructure
- **Résultat** : Erreur affichée, application crash

### **2. Test erreur Supabase Storage :**

- **Bouton** : "🗄️ Test Storage"
- **Action** : Simule l'erreur `403 Unauthorized`
- **Résultat** : Warning affiché, image de fallback utilisée, application continue

## 📋 **Procédure de test**

### **Test 1 - Erreur Supabase Storage :**

1. **Cliquer** sur "🗄️ Test Storage"
2. **Vérifier** qu'un warning apparaît : `⚠️ Erreur Supabase Storage (test): new row violates row-level security policy - Image par défaut utilisée`
3. **Confirmer** que l'image de fallback est définie
4. **Vérifier** que l'application continue à fonctionner

### **Test 2 - Erreur réelle :**

1. **Générer un article** complet
2. **Observer** les logs de la console pour les erreurs Supabase
3. **Vérifier** que les erreurs remontent dans l'interface
4. **Confirmer** que les images de fallback sont utilisées

## 🔍 **Messages d'erreur attendus**

### **Erreur RLS Policy :**

```
⚠️ Erreur Supabase Storage: new row violates row-level security policy - Image par défaut utilisée
```

### **Erreur 403 Unauthorized :**

```
⚠️ Upload d'image échoué pour le post 790 - Image par défaut utilisée
```

### **Erreur générale Storage :**

```
⚠️ Erreur Supabase Storage: [message d'erreur] - Image par défaut utilisée
```

## ✅ **Validation finale**

L'application doit maintenant :

- ✅ **Capturer** toutes les erreurs Supabase Storage
- ✅ **Afficher** les erreurs dans l'interface utilisateur
- ✅ **Utiliser** des images de fallback pour continuer
- ✅ **Logger** les détails techniques dans la console
- ✅ **Permettre** à l'utilisateur de fermer les messages
- ✅ **Maintenir** la stabilité de l'application

## 🧹 **Nettoyage après tests**

Une fois les tests terminés, supprimer :

1. `testSupabaseStorageError()` dans Infrastructure
2. `testSupabaseStorageError` dans le Store
3. Le bouton "Test Storage" dans l'interface
4. Les styles CSS associés (`test-storage-button`)

## 🔧 **Solution permanente**

Pour résoudre définitivement le problème Supabase Storage :

1. **Configurer les politiques RLS** dans Supabase Console
2. **Vérifier les permissions** du bucket `jardin-iris-images-post`
3. **Consulter** le fichier `SUPABASE_STORAGE_POLICY.md` pour les détails
