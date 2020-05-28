写一个sql
查询5.22-5.27，指定账号的所有交易记录
类型包括清算、退款、提现、转账
字段包括订单号、运单号、流水号、交易金额，交易时间，修改时间
当该笔交易为付款时金额显示为负数
并只选择交易成功的数据

select
    bill_no,
    business_no,
    trans_no,
    replace(bill_descr, '订单', ''),
    case when pay_account_no = '2000115876254171000027' then -amt else amt end as amt,
    trans_time,
    modify_time
from tableName WHERE
    (pay_account_no = '2000115876254171000027' or rec_account_no = '2000115876254171000027') and
    status = '10' and
    trans_time >= '2020-05-22 11:51:18.000' and
    trans_time <= '2020-05-27 17:15:11.000' and
    trans_type in (1, 4, 5, 7)
order by trans_time desc

in 包含于
order by 排序
case when then else end 逻辑判断
sql中数据类型也应该尽可能一致