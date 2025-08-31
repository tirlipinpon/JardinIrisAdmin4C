# Guide de Test - Gestion des Erreurs

## 🧪 **Tests à effectuer pour vérifier la remontée des erreurs**

### **1. Test d'erreur générique**

- ✅ **Bouton "Test Erreur"** ajouté dans l'interface
- ✅ **Méthode `testError()`** dans Infrastructure
- ✅ **Méthode `testErrorHandling()`** dans le Store
- ✅ **Affichage des erreurs** dans les chips Material

**Procédure :**

1. Ouvrir l'application
2. Cliquer sur le bouton "🐛 Test Erreur"
3. Vérifier qu'une erreur apparaît dans la section des erreurs
4. Vérifier les logs dans la console

### **2. Tests des méthodes Infrastructure**

#### **Méthodes avec `wrapWithErrorHandling` ✅**

- `getNextPostId()`
- `getLastPostTitreAndId()`
- `setPost()`
- `setImageUrl()`
- `setVideo()`
- `setFaq()`
- `internalImage()`
- `setInternalLink()`
- `vegetal()`
- `savePostComplete()`
- `saveFaqItems()`
- `saveInternalImages()`

#### **Test manuel des erreurs :**

1. **Erreur Supabase** : Désactiver la connexion internet
2. **Erreur OpenAI** : Utiliser une clé API invalide
3. **Erreur de parsing JSON** : Simuler une réponse malformée

### **3. Vérifications dans le Store**

#### **Flux des erreurs :**

```typescript
Infrastructure.method()
  → wrapWithErrorHandling()
  → catchError()
  → handleError()
  → PostgrestError

Store.method()
  → throwOnPostgrestError()
  → throw error
  → catchError dans tap()
  → store['addError']()
  → patchState({ error: [...] })
```

#### **Points de contrôle :**

- ✅ Toutes les méthodes utilisent `throwOnPostgrestError`
- ✅ Toutes les erreurs sont capturées dans `tap({ error: ... })`
- ✅ Les erreurs sont ajoutées via `store['addError']`
- ✅ L'état des erreurs est mis à jour dans le store

### **4. Affichage des erreurs dans l'UI**

#### **Composants Material utilisés :**

- `mat-card` avec classe `error-card`
- `mat-chip-set` pour la liste des erreurs
- `mat-chip` avec `mat-icon` pour chaque erreur
- Bouton de fermeture pour nettoyer les erreurs

#### **CSS appliqué :**

- Style d'erreur avec bordure rouge
- Chips colorées en rouge pour les erreurs
- Animation d'entrée pour les nouvelles erreurs

### **5. Checklist de validation**

- [ ] Le bouton "Test Erreur" déclenche bien une erreur
- [ ] L'erreur apparaît dans la section des erreurs
- [ ] Le bouton "✕" permet de fermer les erreurs
- [ ] Les erreurs persistent jusqu'à ce qu'elles soient fermées
- [ ] Plusieurs erreurs peuvent s'accumuler
- [ ] Les logs apparaissent correctement dans la console
- [ ] L'application ne crash pas en cas d'erreur
- [ ] Le loading s'arrête même en cas d'erreur

### **6. Messages d'erreur attendus**

#### **Test d'erreur générique :**

```
🧪 [INFRASTRUCTURE] Erreur dans testError - Test de la gestion d'erreur:
Error: Erreur de test pour vérifier la remontée dans le store
```

#### **Erreur Supabase Storage (corrigée) :**

```
🚫 Erreur upload Supabase Storage
→ Fallback vers image placeholder
```

#### **Erreur OpenAI :**

```
❌ Erreur dans setPost - Génération d'article avec OpenAI
→ Affichage dans les chips d'erreur
```

## 🔧 **Nettoyage après les tests**

Une fois les tests terminés, supprimer :

1. La méthode `testError()` dans Infrastructure
2. La méthode `testErrorHandling()` dans le Store
3. Le bouton "Test Erreur" dans l'interface
4. Les styles CSS associés

## ✅ **Validation finale**

L'application doit :

- ✅ Capturer toutes les erreurs des services
- ✅ Les transformer en format standardisé (PostgrestError)
- ✅ Les remonter dans le store via `addError`
- ✅ Les afficher dans l'interface utilisateur
- ✅ Permettre à l'utilisateur de les fermer
- ✅ Continuer à fonctionner même en cas d'erreur
