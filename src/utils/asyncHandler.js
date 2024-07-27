const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err)=> next(err));
    }
}



export {asyncHandler}





//using try catch block

// const asyncHandler = (func)=>async (req, res, next)=>{
//     try {
//         await func(req, res, next);
//     } catch (error) {
//         res.error(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

