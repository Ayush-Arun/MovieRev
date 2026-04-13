import os
import re

entity_dir = r"E:\TechBuild\MovieRev\backend\src\main\java\com\cinevault\entity"
security_dir = r"E:\TechBuild\MovieRev\backend\src\main\java\com\cinevault\security"
config_dir = r"E:\TechBuild\MovieRev\backend\src\main\java\com\cinevault\config"
dto_dir = r"E:\TechBuild\MovieRev\backend\src\main\java\com\cinevault\dto"
response_dir = r"E:\TechBuild\MovieRev\backend\src\main\java\com\cinevault\response"

dirs = [entity_dir, security_dir, config_dir, dto_dir, response_dir]

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "lombok" not in content.lower():
        return

    print("Processing", filepath)
    
    # Remove lombok imports
    content = re.sub(r'import\s+lombok\.[a-zA-Z0-9_.]+;\n?', '', content)
    # Remove lombok annotations
    content = re.sub(r'@(Data|Getter|Setter|NoArgsConstructor|AllArgsConstructor|Builder)\b\s*', '', content)

    # find class name
    class_match = re.search(r'public\s+(?:abstract\s+)?class\s+(\w+)', content)
    record_match = re.search(r'public\s+record\s+(\w+)', content)
    
    if record_match:
        return # Skip records

    if not class_match: return
    class_name = class_match.group(1)

    # find fields
    # this regex matches generic fields as well
    fields_pattern = r'private\s+([\w<>,? ]+)\s+(\w+)\s*(?:=\s*[^;]+)?;'
    fields = re.findall(fields_pattern, content)

    getters_setters = ""
    # Constructor no args
    getters_setters += f"\n    public {class_name}() {{}}\n"
    
    # Constructor all args
    if fields:
        args_str = ", ".join([f"{t.strip()} {n.strip()}" for t, n in fields])
        assignments = "\n".join([f"        this.{n.strip()} = {n.strip()};" for t, n in fields])
        getters_setters += f"\n    public {class_name}({args_str}) {{\n{assignments}\n    }}\n"

    for field_type, field_name in fields:
        field_type = field_type.strip()
        field_name = field_name.strip()
        
        capitalized = field_name[0].upper() + field_name[1:]
        
        # Avoid generating duplicated getters/setters if they already exist
        if f"get{capitalized}(" not in content:
            getters_setters += f"""
    public {field_type} get{capitalized}() {{
        return {field_name};
    }}
"""
        if f"set{capitalized}(" not in content:
            getters_setters += f"""
    public void set{capitalized}({field_type} {field_name}) {{
        this.{field_name} = {field_name};
    }}
"""
    # replace the file contents
    last_brace_idx = content.rfind('}')
    if last_brace_idx != -1:
        content = content[:last_brace_idx] + getters_setters + "\n}\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

for directory in dirs:
    if os.path.exists(directory):
        for dirname, _, files in os.walk(directory):
            for filename in files:
                if filename.endswith(".java"):
                    process_file(os.path.join(dirname, filename))
print("Done processing files")
