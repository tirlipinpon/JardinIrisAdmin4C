# ✅ Correction de l'erreur `store.addError is not a function`

## 🐛 **Problème identifié**

L'erreur `store.addError is not a function` se produisait dans toutes les méthodes du store qui essayaient d'ajouter des erreurs via `store['addError']()`.

## 🔍 **Cause racine**

Dans le contexte de `withMethods()` de NgRx Signals, les méthodes définies localement (comme `addError` et `clearErrors`) ne sont pas accessibles via l'objet `store` lui-même. Elles ne deviennent des méthodes publiques du store qu'après la création complète du store.

## 🔧 **Solution appliquée**

### **Avant (❌ Incorrect) :**

```typescript
error: (error: unknown) => store["addError"](extractErrorMessage(error));
```

### **Après (✅ Correct) :**

```typescript
error: (error: unknown) => addError(extractErrorMessage(error));
```

## 📝 **Changements effectués**

### **1. Dans le Store (`store/index.ts`) :**

- ✅ **12 occurrences** de `store['addError']` remplacées par `addError`
- ✅ **Toutes les méthodes** utilisent maintenant la fonction locale
- ✅ **Méthodes publiques** `addError` et `clearErrors` conservées pour l'usage externe

### **2. Méthodes corrigées :**

- `getNextPostId()` - Gestion d'erreur ID de post
- `getLastPostTitreAndId()` - Gestion d'erreur titres de posts
- `setPost()` - Gestion d'erreur génération d'article
- `setImageUrl()` - Gestion d'erreur upload d'image
- `setVideo()` - Gestion d'erreur recherche vidéo
- `setFaq()` - Gestion d'erreur génération FAQ
- `internalImage()` - Gestion d'erreur images internes
- `setInternalLink()` - Gestion d'erreur liens internes
- `vegetal()` - Gestion d'erreur noms botaniques
- `testErrorHandling()` - Méthode de test
- `saveAllToSupabase()` - Gestion d'erreur sauvegarde

## 🎯 **Résultat**

### **Fonctionnement correct :**

```typescript
// Dans withMethods scope
const addError = (errorMessage: string) => { ... };

// Usage interne dans les méthodes
error: (error: unknown) => addError(extractErrorMessage(error))

// Usage externe depuis les composants
this.store.addError('Message d\'erreur');
this.store.clearErrors();
```

## 🧪 **Test de validation**

1. **Cliquer sur "🐛 Test Erreur"**
2. **Vérifier** qu'aucune erreur `store.addError is not a function` n'apparaît
3. **Confirmer** que l'erreur de test s'affiche dans les chips Material
4. **Tester** le bouton de fermeture des erreurs

## 📚 **Leçon apprise**

Dans NgRx Signals `withMethods()`, il faut distinguer :

- **Fonctions locales** : Utilisées dans le scope de `withMethods`
- **Méthodes publiques** : Exposées dans l'objet retourné pour usage externe

La règle : **Utiliser les fonctions locales à l'intérieur, les méthodes publiques à l'extérieur.**
