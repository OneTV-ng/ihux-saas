import re

def convert_copy_to_insert(table, columns, rows):
    insert_sql = []
    for row in rows:
        # Replace \N with NULL and escape single quotes
        values = [
            'NULL' if v == '\\N' else f"'{v.replace("'", "''")}'" for v in row.split('\t')
        ]
        insert_sql.append(f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(values)});")
    return insert_sql

with open('migration_data.sql', 'r') as f:
    lines = f.readlines()

output = []
copy_re = re.compile(r'^COPY ([\w\.\"]+) \(([^)]+)\) FROM stdin;')
rows = []
table = None
columns = None
for line in lines:
    m = copy_re.match(line)
    if m:
        table = m.group(1).replace('"', '')
        columns = [c.strip() for c in m.group(2).split(',')]
        rows = []
        continue
    if table and columns:
        if line.strip() == '\\.':
            output.extend(convert_copy_to_insert(table, columns, rows))
            table = None
            columns = None
            rows = []
        else:
            rows.append(line.rstrip('\n'))
    elif not line.startswith('COPY') and not line.startswith('SET') and not line.startswith('SELECT') and not line.startswith('--') and not line.startswith('\\'):
        output.append(line)

with open('migration_data_mysql.sql', 'w') as f:
    for stmt in output:
        f.write(stmt + '\n')

print('Conversion complete. Output: migration_data_mysql.sql')
