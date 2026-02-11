import re

with open('migration_data_mysql.sql', 'r') as f:
    sql = f.read()

# Remove 'public.' prefix from table names
sql = re.sub(r'INSERT INTO public\.', 'INSERT INTO ', sql)
sql = re.sub(r'COPY public\.', 'COPY ', sql)

with open('migration_data_mysql_clean.sql', 'w') as f:
    f.write(sql)

print('Cleaned migration_data_mysql.sql. Output: migration_data_mysql_clean.sql')
