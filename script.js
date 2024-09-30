const members = [];
const records = [];

// 添加成员
document.getElementById('memberForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    if (name && !members.includes(name)) {
        members.push(name);
        displayMembers();
        this.reset();
    } else if (members.includes(name)) {
        alert('该成员已存在！');
    } else {
        alert('姓名不能为空！');
    }
});

// 删除成员
function removeMember(member) {
    const index = members.indexOf(member);
    if (index > -1) {
        members.splice(index, 1);
        displayMembers();
    }
}

// 计算费用
document.getElementById('billingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const expensePurpose = document.getElementById('expensePurpose').value.trim();
    const payer = document.getElementById('payer').value.trim();

    if (isNaN(totalAmount) || totalAmount <= 0) {
        alert('请输入有效的总金额！');
        return;
    }
    
    if (members.includes(payer) && members.length > 0) {
        displayCosts(totalAmount, payer);
        document.getElementById('saveRecords').style.display = 'block'; // 显示保存按钮
    } else {
        alert('付款人必须是成员。');
    }
});

// 保存记录
document.getElementById('saveRecords').addEventListener('click', function() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').value);
    const expensePurpose = document.getElementById('expensePurpose').value.trim();
    const payer = document.getElementById('payer').value.trim();
    const individualCost = totalAmount / members.length; // 所有成员均摊

    const record = {
        totalAmount,
        expensePurpose,
        payer,
        time: new Date().toLocaleString(),
        costs: {}
    };

    members.forEach(member => {
        record.costs[member] = individualCost;  // 更新每个成员的费用
    });

    records.push(record);
    alert('记录已保存！');
    document.getElementById('saveRecords').style.display = 'none'; // 隐藏保存按钮
    displayRecords(); // 更新显示记录
});

// 显示成员
function displayMembers() {
    const memberList = document.getElementById('memberList');
    memberList.innerHTML = '';

    members.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member;

        const removeButton = document.createElement('button');
        removeButton.textContent = '删除';
        removeButton.onclick = () => removeMember(member);

        li.appendChild(removeButton);
        memberList.appendChild(li);
    });
}

// 显示费用
function displayCosts(totalAmount, payer) {
    const costList = document.getElementById('costList');
    costList.innerHTML = '';

    const individualCost = totalAmount / members.length; // 所有成员均摊

    members.forEach(member => {
        const li = document.createElement('li');
        li.textContent = `${member}: ${individualCost.toFixed(2)} 元`;
        costList.appendChild(li);
    });
}

// 显示所有记录
function displayRecords() {
    const totalCostList = document.getElementById('totalCostList');
    totalCostList.innerHTML = '';

    if (records.length === 0) {
        totalCostList.innerHTML = '<li>没有记录。</li>';
        return;
    }

    // 按时间排序
    records.sort((a, b) => new Date(b.time) - new Date(a.time));

    records.forEach((record, index) => {
        const li = document.createElement('li');
        li.textContent = `索引: ${index} | 时间: ${record.time} | 消费用途: ${record.expensePurpose} | 付款人: ${record.payer} | 总金额: ${record.totalAmount.toFixed(2)} 元`;
        
        const costsList = document.createElement('ul');
        for (const member in record.costs) {
            const costLi = document.createElement('li');
            costLi.textContent = `${member}: ${record.costs[member].toFixed(2)} 元`;
            costsList.appendChild(costLi);
        }

        li.appendChild(costsList);
        totalCostList.appendChild(li);
    });
}

// 切换查看记录
document.getElementById('toggleRecords').addEventListener('click', function() {
    const totalCostList = document.getElementById('totalCostList');
    if (totalCostList.style.display === 'none') {
        totalCostList.style.display = 'block';
        this.textContent = '关闭查看记录';
        displayRecords(); // 更新显示记录
    } else {
        totalCostList.style.display = 'none';
        this.textContent = '打开查看记录';
    }
});

// 删除记录
document.getElementById('deleteRecord').addEventListener('click', function() {
    const recordIndex = parseInt(document.getElementById('recordIndex').value);
    const confirmText = document.getElementById('confirmDelete').value.trim();

    if (confirmText === '删除' && recordIndex >= 0 && recordIndex < records.length) {
        records.splice(recordIndex, 1);
        alert('记录已删除！');
        displayRecords();
    } else {
        alert('输入不正确，无法删除记录。');
    }
});

// 查看成员总金额
document.getElementById('checkTotal').addEventListener('click', function() {
    const memberToCheck = document.getElementById('memberToCheck').value.trim();
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');
    totalAmountDisplay.innerHTML = '';

    if (members.includes(memberToCheck)) {
        let totalCost = 0;
        
        records.forEach(record => {
            if (record.costs[memberToCheck]) {
                totalCost += record.costs[memberToCheck];
            }
        });
        
        totalAmountDisplay.textContent = `${memberToCheck} 总共需要支付: ${totalCost.toFixed(2)} 元`;
    } else {
        totalAmountDisplay.textContent = '未找到该成员。';
    }
});

// 查看支付给付款人的总金额
document.getElementById('togglePayerTotal').addEventListener('click', function() {
    const payerTotalList = document.getElementById('payerTotalList');
    payerTotalList.innerHTML = '';

    if (payerTotalList.style.display === 'none') {
        const payerTotals = {};

        records.forEach(record => {
            const payer = record.payer;
            if (!payerTotals[payer]) {
                payerTotals[payer] = {
                    total: 0,
                    details: {}
                };
            }

            for (const member in record.costs) {
                if (!payerTotals[payer].details[member]) {
                    payerTotals[payer].details[member] = 0;
                }
                payerTotals[payer].total += record.costs[member];
                payerTotals[payer].details[member] += record.costs[member]; // 每个成员需支付的总金额
            }
        });

        for (const payer in payerTotals) {
            const li = document.createElement('li');
            li.textContent = `${payer} 总共收到: ${payerTotals[payer].total.toFixed(2)} 元`;

            const detailsList = document.createElement('ul');
            for (const member in payerTotals[payer].details) {
                const detailLi = document.createElement('li');
                detailLi.textContent = `${member}: ${payerTotals[payer].details[member].toFixed(2)} 元`;
                detailsList.appendChild(detailLi);
            }

            li.appendChild(detailsList);
            payerTotalList.appendChild(li);
        }

        payerTotalList.style.display = 'block';
        this.textContent = '关闭查看付款人总金额';
    } else {
        payerTotalList.style.display = 'none';
        this.textContent = '打开查看付款人总金额';
    }
});
