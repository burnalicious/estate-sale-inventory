CREATE TABLE sale (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    address1    VARCHAR(255) NOT NULL,
    address2    VARCHAR(255),
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(2)   NOT NULL,
    zip_code    VARCHAR(10)  NOT NULL,
    sale_date   DATE         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'UPCOMING',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE item (
    id          BIGSERIAL      PRIMARY KEY,
    sale_id     BIGINT         NOT NULL REFERENCES sale(id) ON DELETE CASCADE,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    condition   VARCHAR(50),
    price       DECIMAL(10,2)  NOT NULL,
    status      VARCHAR(20)    NOT NULL DEFAULT 'AVAILABLE',
    photo_url   VARCHAR(500),
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_sale_id ON item(sale_id);
CREATE INDEX idx_item_status ON item(status);
CREATE INDEX idx_sale_status ON sale(status);
