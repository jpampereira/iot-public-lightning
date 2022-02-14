CREATE DATABASE "PGC"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

\c PGC

CREATE TABLE ZONES (
	ID SMALLSERIAL PRIMARY KEY,
	ZONE CHARACTER VARYING(10) NOT NULL
);

CREATE TABLE DISTRICTS (
	ID SERIAL PRIMARY KEY,
	DISTRICT CHARACTER VARYING(50) NOT NULL,
	ZONE_ID SMALLSERIAL NOT NULL,
	FOREIGN KEY (ZONE_ID) REFERENCES ZONES(ID)
);

CREATE TABLE DEVICES_INVENTORY (
	ID SERIAL PRIMARY KEY,
	DEVICE_NAME CHARACTER VARYING(10) UNIQUE NOT NULL,
	COORDINATES CHARACTER VARYING(50) NOT NULL,
	STREET CHARACTER VARYING(100) NOT NULL,
	DISTRICT_ID SERIAL NOT NULL,
	INTERVAL INT NOT NULL,
	STATUS BOOLEAN NOT NULL,
	IS_REAL BOOLEAN NOT NULL,
	FOREIGN KEY (DISTRICT_ID) REFERENCES DISTRICTS(ID)
);

CREATE TABLE SENSORS_DATA_REAL_TIME (
	ID SERIAL PRIMARY KEY,
	DEVICE_ID SERIAL NOT NULL,
	VOLTAGE SMALLINT NOT NULL,
	CURRENT REAL NOT NULL,
	LIGHTNESS SMALLINT NOT NULL,
	RELE_STATE BOOLEAN NOT NULL,
	INSERTION_TIME TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (DEVICE_ID) REFERENCES DEVICES_INVENTORY(ID)
);

CREATE TABLE SENSORS_DATA_INTERVAL (
	ID SERIAL PRIMARY KEY,
	DEVICE_ID SERIAL NOT NULL,
	VOLTAGE_MIN SMALLINT NOT NULL,
	VOLTAGE_MAX SMALLINT NOT NULL,
	VOLTAGE_AVG SMALLINT NOT NULL,
	CURRENT_MIN REAL NOT NULL,
	CURRENT_MAX REAL NOT NULL,
	CURRENT_AVG REAL NOT NULL,
	LIGHTNESS_MIN SMALLINT NOT NULL,
	LIGHTNESS_MAX SMALLINT NOT NULL,
	LIGHTNESS_AVG SMALLINT NOT NULL,
	POWER_MIN SMALLINT NOT NULL,
	POWER_MAX SMALLINT NOT NULL,
	POWER_AVG SMALLINT NOT NULL,
	POWER_EXPEND REAL NOT NULL,
	NUM_REGISTRIES SMALLINT NOT NULL,
	INSERTION_TIME TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (DEVICE_ID) REFERENCES DEVICES_INVENTORY(ID)
);