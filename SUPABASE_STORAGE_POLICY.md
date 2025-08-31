# Configuration Supabase Storage - Politiques RLS

## Problème identifié

L'erreur `403 Unauthorized` avec le message `new row violates row-level security policy` indique que les politiques RLS (Row Level Security) bloquent l'upload d'images dans le bucket Supabase Storage.

## Solution recommandée

### 1. Vérifier les politiques du bucket

Dans la console Supabase, aller dans `Storage` > `Policies` et vérifier les politiques pour le bucket `jardin-iris-images-post`.

### 2. Créer une politique d'upload permissive (temporaire)

```sql
-- Politique pour permettre l'upload d'images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jardin-iris-images-post');

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'jardin-iris-images-post');

-- Politique pour permettre la suppression/mise à jour
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'jardin-iris-images-post');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'jardin-iris-images-post');
```

### 3. Alternative : Désactiver RLS temporairement

Si les politiques ne fonctionnent pas, vous pouvez temporairement désactiver RLS :

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Attention** : Cette solution n'est pas recommandée en production.

### 4. Vérifier la configuration du bucket

- Le bucket doit être configuré comme **public**
- Les politiques doivent être activées
- L'utilisateur doit être authentifié

## Correction temporaire dans le code

En attendant la correction des politiques Supabase, le code a été modifié pour :

- ✅ Gérer gracieusement les erreurs d'upload
- ✅ Utiliser des images placeholder en cas d'échec
- ✅ Continuer le processus même si l'upload échoue
- ✅ Logger les erreurs pour le debugging

## URLs de fallback utilisées

- Image par défaut : `https://via.placeholder.com/800x400/4caf50/white?text=Image+Jardin+Iris`
- Image d'erreur : `https://via.placeholder.com/800x400/4caf50/white?text=Image+Non+Disponible`
- Pas d'image générée : `https://via.placeholder.com/800x400/666/white?text=Aucune+Image+Generee`
