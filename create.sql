DROP DATABASE IF EXISTS stepforward_db;
CREATE DATABASE stepforward_db;
USE stepforward_db;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS Classes;
DROP TABLE IF EXISTS Users;
DROP TABLE If EXISTS Bible;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE Classes (
	cid int not null auto_increment,
	title varchar(255) not null,
	speaker varchar(255) not null,
	max int not null,
	current int not null,
	details varchar(3000),
	CHECK (current <= max),
	CHECK (current >= 0),
	PRIMARY KEY (cid)
);

CREATE TABLE Bible (
	bid int not null auto_increment,
	title varchar(255) not null,
	speaker varchar(255) not null,
	location varchar(255),
	max int not null,
	current int not null,
	details varchar(3000),
	CHECK (current <= max),
	CHECK (current >= 0),
	PRIMARY KEY (bid)
);

CREATE TABLE Users (
  uid int not null auto_increment,
  name varchar(255) not null,
  password varchar(255) not null,
  earth varchar(255) not null,
  campus varchar(255) not null,
  year varchar(255) not null,
  cid int,
  bid int,
  PRIMARY KEY (uid),
  FOREIGN KEY (cid) REFERENCES Classes(cid) ON DELETE SET NULL,
  FOREIGN KEY (bid) REFERENCES Bible(bid) ON DELETE SET NULL
);

delimiter |
CREATE TRIGGER registerClass BEFORE UPDATE ON Classes
	FOR EACH ROW BEGIN
		IF NEW.current > NEW.max or NEW.current < 0 THEN
			SIGNAL SQLSTATE '45000';
		END IF;
	END;
	|
delimiter ;

delimiter |
CREATE TRIGGER registerBible BEFORE UPDATE ON Bible
	FOR EACH ROW BEGIN
		IF NEW.current > NEW.max or NEW.current < 0 THEN
			SIGNAL SQLSTATE '45000';
		END IF;
	END;
	|
delimiter ;

ALTER DATABASE stepforward_db CHARACTER SET utf8 COLLATE utf8_general_ci;

ALTER TABLE Classes CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE Bible CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE Users CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;