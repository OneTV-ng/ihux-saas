import re

allowed_roles = set([
    'guest','new','member','artist','band','studio','choir','group','community','label','editor','manager','admin','sadmin','user'
])

def fix_role(match):
    value = match.group(1)
    if value not in allowed_roles:
        return "'user'"
    return f"'{value}'"

with open('migration_data_mysql_fixed.sql', 'r') as f:
    sql = f.read()

# Find all INSERT INTO user statements and fix role values
sql = re.sub(r"INSERT INTO user \(([^\)]*)\) VALUES \(([^\)]*)\);", lambda m: re.sub(r"'([^']*)'", fix_role, m.group(0), count=1), sql)

with open('migration_data_mysql_rolescan.sql', 'w') as f:
    f.write(sql)

print('All role values scanned and fixed. Output: migration_data_mysql_rolescan.sql')
