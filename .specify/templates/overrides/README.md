# Overrides szablonów Spec Kit

Pliki `.md` w tym katalogu **nadpisują** szablony core z [`.specify/templates/`](../) przy rozwiązywaniu nazwy przez `resolve_template()` w [`.specify/scripts/bash/common.sh`](../../scripts/bash/common.sh) (priorytet: **overrides → presety → rozszerzenia → core**).

Używaj tutaj jednorazowych dostosowań projektu, żeby po `specify init` / upgrade nie trzeba było ponownie edytować plików w `templates/` generowanych przez upstream.

Nazwa pliku override musi odpowiadać nazwie szablonu, np. `spec-template.md` → umieść `spec-template.md` w tym folderze.
