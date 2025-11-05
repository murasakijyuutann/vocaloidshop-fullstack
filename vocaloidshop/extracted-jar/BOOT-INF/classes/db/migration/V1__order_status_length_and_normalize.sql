-- Ensure status column can store canonical enum names
ALTER TABLE `order`
  MODIFY `status` varchar(32) NOT NULL DEFAULT 'PAYMENT_RECEIVED';

-- Normalize legacy/synonym values to canonical names
UPDATE `order` SET `status` = 'PAYMENT_RECEIVED' WHERE UPPER(`status`) IN ('PAID','PAYED','PAYMENT_CONFIRMED','PAYMENT');
UPDATE `order` SET `status` = 'PREPARING'        WHERE UPPER(`status`) IN ('PREPARING','PACKING','PICKING');
UPDATE `order` SET `status` = 'READY_FOR_DELIVERY' WHERE UPPER(`status`) IN ('READY_FOR_SHIPMENT','READY_TO_SHIP');
UPDATE `order` SET `status` = 'IN_DELIVERY'      WHERE UPPER(`status`) IN ('SHIPPED','OUT_FOR_DELIVERY','IN_TRANSIT');
UPDATE `order` SET `status` = 'DELIVERED'        WHERE UPPER(`status`) IN ('DELIVERED','COMPLETED');
UPDATE `order` SET `status` = 'CANCELED'         WHERE UPPER(`status`) IN ('CANCELED','CANCELLED');
