import sqlite3

conn = sqlite3.connect('instance/practicompu.db')
c = conn.cursor()

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN ubicacion VARCHAR(100)")
    print("Added ubicacion")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN sitio_web VARCHAR(255)")
    print("Added sitio_web")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE selected_candidate ADD COLUMN estado VARCHAR(20) DEFAULT 'En proceso'")
    print("Added estado")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE vacancy ADD COLUMN modalidad VARCHAR(20) DEFAULT 'Presencial'")
    print("Added modalidad")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE vacancy ADD COLUMN tipo_contrato VARCHAR(20) DEFAULT 'Tiempo completo'")
    print("Added tipo_contrato")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE student_profile ADD COLUMN rol VARCHAR(100)")
    print("Added rol")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE student_profile ADD COLUMN descripcion TEXT")
    print("Added descripcion")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE student_profile ADD COLUMN habilidades VARCHAR(255)")
    print("Added habilidades")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN industria VARCHAR(100)")
    print("Added industria")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN tamano_empresa VARCHAR(50)")
    print("Added tamano_empresa")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN anio_fundacion VARCHAR(10)")
    print("Added anio_fundacion")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN banner_url TEXT")
    print("Added banner_url")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN linkedin VARCHAR(255)")
    print("Added linkedin")
except Exception as e:
    print(e)

try:
    c.execute("ALTER TABLE company_profile ADD COLUMN instagram VARCHAR(255)")
    print("Added instagram")
except Exception as e:
    print(e)

conn.commit()
conn.close()
