export async function successResponse(res, message = "", data = null) {
    return res.status(200).json({
       status:200,
       error:false,
       message,
       data,
     });
   }
   
   export async function errorResponse(res, status, message = "") {
    return  res.status(200).json({
       status: 200,
       error: true,
       message,
       data: null,
     });
   }
   