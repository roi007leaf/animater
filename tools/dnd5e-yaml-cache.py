"""Convert public official D&D YAML sources into one deterministic JSON cache."""
import json
import pathlib
import sys
import yaml

request = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
rows = []
loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
for entry in request["entries"]:
    source = yaml.load(pathlib.Path(entry["file"]).read_text(encoding="utf-8"), Loader=loader)
    if isinstance(source, dict) and source.get("_id") and source.get("name"):
        rows.append({"pack": entry["pack"], "path": entry["path"], "blobSha": entry["sha"], "source": source})
pathlib.Path(request["output"]).write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({"rows": len(rows), "output": request["output"]}))
