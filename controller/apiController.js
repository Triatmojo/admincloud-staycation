const Item = require('../models/Item');
const Travelers = require('../models/Booking');
const Treasure = require('../models/Activity');
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Booking = require('../models/Booking');
const Member = require('../models/Member');


module.exports = {
    landingPage: async (req, res) => {
        try {
            const traveler = await Travelers.find();
            const treasure = await Treasure.find();
            const city = await Item.find();
    
            const mostPicked = await Item.find()
                .select('_id title city country price imageId')
                .populate({ path: 'imageId', select: '_id imageUrl' })
                .limit(5);
            
            const category = await Category.find()
                .select('_id name')
                .limit(3)
                .populate({
                    path: 'itemId',
                    select: '_id title country city imageId isPopular',
                    perDocumentLimit: 4,
                    option: { sort: {sumBooking: -1}},
                    populate: {
                        path: 'imageId',
                        select: '_id imageUrl',
                        perDocumentLimit: 1
                    },
                    
                });
            
            for (let i = 0; i < category.length; i++) {
                for (let x = 0; x < category[i].itemId.length; x++) {
                    const item = await Item.findOne({ _id: category[i].itemId[x]._id });
                    item.isPopular = false;
                    await item.save();
    
                    if (category[i].itemId[0] === category[i].itemId[x]) {
                        item.isPopular = true;
                        await item.save();
                    }
                }
            }

           const testimonial =  {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial2.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon... ",
                familyName: "Tri",
                familyOccupation: "Web Developer"
              }
            
            res.status(200).json({
                hero: {
                    travelers: traveler.length,
                    treasures: treasure.length,
                    cities: city.length
                },
                mostPicked,
                category,
                testimonial
            });
            
        } catch (error) {
        res.status(500).json({ message: 'Oppss!! Internal server error' });
        }
    },

    detailPage: async (req, res) => {
        const { id } = req.params;
        try {
            const item = await Item.findOne({ _id: id })
                .populate({path: 'imageId', select: '_id imageUrl'})
                .populate({path: 'featureId', select: '_id name qty imageUrl'})
                .populate({ path: 'activityId', select: '_id name type imageUrl' })
            const bank = await Bank.find();
            const testimonial =  {
                _id: "asd1293uasdads1",
                imageUrl: "images/testimonial1.jpg",
                name: "Happy Family",
                rate: 4.55,
                content: "What a great trip with my family and I should try again next time soon... ",
                familyName: "Tri",
                familyOccupation: "Web Developer"
              }
            
            res.status(200).json({
                ...item._doc,
                bank, 
                testimonial
            });

        } catch (error) {
            res.status(500).json({ message: 'Oppss!! Internal server error' });
        }
    },

    bookingPage: async (req, res) => {
        const {
            idItem,
            duration,
            // price,
            bookingStartDate,
            bookingEndDate,
            firstName,
            lastName,
            email,
            phoneNumber,
            accountHolder,
            bankFrom,
        } = req.body;

        
        if (!req.file) return res.status(404).json({ message: 'Image not found!!' });
        
        
        if (
            idItem === undefined ||
            duration === undefined ||
            //price === undefined ||
            bookingStartDate === undefined ||
            bookingEndDate === undefined ||
            firstName === undefined ||
            lastName === undefined ||
            email === undefined ||
            phoneNumber === undefined ||
            accountHolder === undefined ||
            bankFrom === undefined) {
             res.status(404).json({ message: 'Required field!!'})
        }

        const item = await Item.findOne({ _id: idItem });

        if (!item) res.status(404).json({ message: 'Item not found!! ' });
        
        item.sumBooking + 1;
        await item.save();

        let total = item.price * duration;
        let tax = total * 0.10;

        const invoice = Math.floor(1000000 + Math.random() * 9000000);

        const member = await Member.create({
            firstName,
            lastName,
            email,
            phoneNumber
        })

        const newBooking = {
            invoice,
            bookingStartDate,
            bookingEndDate,
            itemId: {
                _id: item.id,
                title: item.title,
                price: item.price,
                duration: duration      
            },
            total: total + tax,
            memberId: member.id,
            payments: {
                proofPayment: `images/${req.file.filename}`,
                bankFrom: bankFrom,
                accountHolder: accountHolder,
            }
        }

        const booking = await Booking.create(newBooking);

        res.status(201).json({ message: 'Yeay, you success booking', booking})
    }


}