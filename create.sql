DROP DATABASE IF EXISTS chapel_db;
CREATE DATABASE chapel_db;
USE chapel_db;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS Classes;
DROP TABLE IF EXISTS Users;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE Classes (
	cid int not null auto_increment,
	topic varchar(255) not null,
	title varchar(255) not null,
	speaker varchar(255) not null,
	max int not null,
	current int not null,
	details varchar(3000),
	location varchar(255),
	CHECK (current <= max),
	CHECK (current >= 0),
	PRIMARY KEY (cid)
);

CREATE TABLE Users (
  uid int not null auto_increment,
  name varchar(255) not null,
  password varchar(255) not null,
  campus varchar(255) not null,
  year varchar(255) not null,
  cid int,
  PRIMARY KEY (uid),
  FOREIGN KEY (cid) REFERENCES Classes(cid) ON DELETE SET NULL
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

ALTER DATABASE chapel_db CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE Classes CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE Users CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;