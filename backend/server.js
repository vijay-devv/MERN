const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const seedDatabase = require('./seedData');
const Transaction = require('./models/Transaction');
const connectDB = require('./database');

app.use(cors({
  origin: 'http://localhost:3000/'
}));
connectDB(); 

const PORT = process.env.PORT || 5000;

app.use(express.json());


seedDatabase();


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/transactions', async (req, res) => {
  const { page = 1, perPage = 10, search } = req.query;
  const skip = (page - 1) * perPage;
  const limit = parseInt(perPage);

  const startDate = new Date('2021-11-27T14:59:54.000+00:00');
  const endDate = new Date('2022-01-27T14:59:54.000+00:00');

  try {
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { price: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(limit);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/statistics/:month', async (req, res) => {
  const { month } = req.params;

  try {
    const startDate = new Date(month);
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: null, totalAmount: { $sum: '$price' } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({ dateOfSale: { $gte: startDate, $lt: endDate }, sold: true });
    const totalUnsoldItems = await Transaction.countDocuments({ dateOfSale: { $gte: startDate, $lt: endDate }, sold: false });

    res.json({
      totalSaleAmount: totalSaleAmount.length ? totalSaleAmount[0].totalAmount : 0,
      totalSoldItems,
      totalUnsoldItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/bar-chart/:month', async (req, res) => {
    const { month } = req.params;
  
    try {
      const priceRanges = [
        { range: '0-100', count: await Transaction.countDocuments({ 
          dateOfSale: { $gte: new Date(`${month}-01T00:00:00.000Z`), $lt: new Date(`${month}-02T00:00:00.000Z`) },
          price: { $lte: 100 } 
        }) },
        
      ];
  
      res.json(priceRanges);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

app.get('/pie-chart/:month', async (req, res) => {
    try {
        const { month } = req.params;

        
        const categories = await Transaction.aggregate([
            {
                $addFields: {
                    saleMonth: { $dateToString: { format: '%Y-%m', date: '$dateOfSale' } }
                }
            },
            {
                $match: { saleMonth: month }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

   
        const formattedData = categories.map(category => ({
            category: category._id,
            count: category.count
        }));

        
        res.json(formattedData);
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const endpoints = [
    'http://localhost:5000/transactions',
    'http://localhost:5000/statistics/:month',
    'http://localhost:5000/pie-chart/:month'
];

app.get('/combined-data/:month', async (req, res) => {
    const { month } = req.params;

    try {
       
        const responses = await Promise.all(endpoints.map(endpoint => axios.get(endpoint.replace(':month', month))));

       
        const combinedData = {
            transactions: responses[0].data,
            statistics: responses[1].data,
            pieChartData: responses[2].data
        };

        
        res.json(combinedData);
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});