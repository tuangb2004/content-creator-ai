import { Icons } from '../Icons';

const ImageStudio = () => {
    return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f172a] p-6 transition-colors duration-200 relative">
            <div className="max-w-6xl mx-auto w-full">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Image studio</h1>
                </header>

                {/* Feature Cards Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4">Nâng tầm hình ảnh marketing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                        {/* Card 1 */}
                        <div className="group relative bg-gray-50 dark:bg-[#1e293b] rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex justify-between items-start mb-2 z-10 relative">
                                <span className="font-semibold text-black dark:text-white"> Thiết kế AI</span>
                            </div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300 mb-3">Nano Banana Pro</span>
                            <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3] relative bg-white dark:bg-slate-700">
                                <img alt="3D colorful balloons car" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuZmFOkpyj16-CsAIQCgbMhfBBZk1LdHER01LxLTbLJAfFzUTbWCE38Y0QTFOWp3b3gPty6SM79PpP9FimXRvRM5-VFkwI9ocQcnKC7IOt3kngtzQ6IvgxCn4GQO4NMmcxro4AxiBVpkqEt0Err_hhacQCISf_tTjqgZAwYcm3xyLwYKbIPVlmOCblOJm3Hlvw7fQLgtXXDDFHi3Eot-Ar96wGvftHOUJCsx6pqVOCP4N_Jb121WVS9NXqK8ml9V7xuZVm3brTOGg" />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="group relative bg-gray-50 dark:bg-[#1e293b] rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex justify-between items-start mb-2 z-10 relative">
                                <span className="font-semibold text-black dark:text-white"> Nền AI</span>
                            </div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 mb-3">New update</span>
                            <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3] relative bg-white dark:bg-slate-700">
                                <img alt="Perfume bottle on podium" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMRKaQzh4uA6gEdSIU2MrkbTi1r0LvHpL3zh-hQ4NPfJm_7NyOjZigr1KugERHBBLMnZVvsFinOZYJNHYOoIX6DBwVSIBk5ZCpzOGLp0HienUkqLdclsEwnNbraVtMvXwbxEv5gUmCgIyZLFOsSLc9N_XWSb3LLgU_BKinfjEfDLk8ngUrcUWVZVnzEJ6csToRZZI-qFKS0qB9AJDXjZXTWNhc8RW7XMP8Xqmg3UtddIlRgCxXKz5aAuA8F2KQifjSh_usRYIC4HI" />
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="group relative bg-gray-50 dark:bg-[#1e293b] rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex justify-between items-start mb-8 z-10 relative">
                                <span className="font-semibold text-black dark:text-white"> Xóa nền</span>
                            </div>
                            <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3] relative bg-transparent flex items-end justify-center">
                                <img alt="Woman portrait transparent background style" className="w-24 h-24 object-cover rounded-full border-4 border-white dark:border-slate-600 shadow-md z-10 absolute bottom-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjTnsq6S54I830pqdh82tw3b7k-BYC2K6IBkjq92lbG8CfxO39IwglLyGRA8b9GlcI-wJsxhvLcrclT1GrBstfIrfHz3CVSvi7R6VNi8Eo7QF4dPlen__Yo_JM80BXUzU_-0gcnl2nxcOFRpSR1EuckhvQLChj9sWvgwk0HJYuRCH1uvRSJeUFvXcF7MlVudNTo1x_2NDxzFzFvkiGrHtVzfs2PAT1ZEKj6ZIX6PQV0SS29NuVJXwrzZgSabJT0x0DxxlaqgDyjIc" />
                                <div className="absolute inset-x-4 bottom-0 top-10 bg-gray-200 dark:bg-slate-600 rounded-t-full opacity-50"></div>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="group relative bg-gray-50 dark:bg-[#1e293b] rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                            <div className="flex justify-between items-start mb-8 z-10 relative">
                                <span className="font-semibold text-black dark:text-white"> Bố cục cho thiết kế</span>
                            </div>
                            <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3] relative bg-white dark:bg-slate-700 p-2 flex items-center justify-center">
                                <div className="w-full h-full relative border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                                    <span className="bg-white dark:bg-slate-900 shadow-sm px-3 py-1 rounded text-xs font-bold transform -rotate-6 border border-gray-200 dark:border-slate-600">BIG SALE</span>
                                    <img alt="Furniture" className="absolute bottom-2 right-2 w-16 h-12 object-cover rounded shadow-sm opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlJq7UYqqsjvBMpTD0roPZg1aISprbSzbVyJeL_jlhmUX-NAWvqjTAR7c-RMSQYPgyIdLK78csF2xfjL1JIlvQnjIaabxgDiVfjo3FmyigeR3DJSfppHDkljTxU7v9YRDMxdXwEgNnVifRDJxFiWhYQEXzNtyAgm8Xh1o8hq-I_K58fZsJRTPC0mK5gWT18C9fIElkd5NKS415obzTyJs-Jq_uXQImLdd7VLLFBJF5zDmCUzHQs5E7vliNIipS5ii0wGaefglW0YI" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Tools Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4">Công cụ nhanh</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1e293b] p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                <img alt="Flower" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsuCb6Q3lOOaHjg6rp5mKhs0dZqCFVAyf5eS1gaClkWbywX26o1ub3_eK7I8yYXtMCIl6IeFcLP-Ira7Yyd_L16ITNKfao0Mjneoeac9fcRXmAPsTNKIMig7UWpdkjScmHArJTZVHJ3M5d-2s3T0Ysm9Do308-rd_2luOc4H64YljuEQJCYwvS0j0FPyfc3jg8P5erFsGRJm0ar5ZddgMFL5_9R9_hDmP8KUBq7-FSJ090GJ8njFIYKHxEPaq3qb6Twww71TEdD1I" />
                            </div>
                            <span className="font-semibold text-black dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Rosify magic</span>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1e293b] p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                <img alt="Puppy" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFtptELWdjV38NvYD9gc7W37TDgys-55WB5iAsoWMo3CUa_-g-rSIWNa88ExwBFs3jkpOIpZ56iiUbSJwU5WQF44eGpWujmc9ad9ULBUiXqJe2JauPGyFsW1pINs7kCDF-ayKOZi4rFewrto5bh0BfUODWIAcvtvI4fBomSQnTyrO41i6K_jhGfLFdRxsh-d7cQnhX2iGEipy8r49Tcpbf4YlG7VcNQxerXogi3lnKz5qJuvx_ceJr6zStKRRQQ546Pg4hDRWw1yo" />
                            </div>
                            <span className="font-semibold text-black dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Tăng chất lượng ảnh</span>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1e293b] p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Icons.Brush size={24} />
                            </div>
                            <span className="font-semibold text-black dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Trình biên tập ảnh</span>
                        </div>
                    </div>
                </section>

                {/* Inspiration Section */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4">Tìm cảm hứng</h2>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        <button className="px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-semibold text-sm whitespace-nowrap">All images</button>
                        <button className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#1e293b] hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium text-sm whitespace-nowrap transition-colors">Product poster</button>
                        <button className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-[#1e293b] hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-medium text-sm whitespace-nowrap transition-colors">Text poster</button>
                    </div>

                    <div className="columns-1 md:columns-2 lg:columns-4 gap-4 space-y-4">
                        <div className="break-inside-avoid rounded-xl overflow-hidden group relative cursor-zoom-in">
                            <img alt="Forest scene" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWPcSPXw5lYnsANxRDHuSz027sRqA92Hh-YuLgrWtDt--HAZT672x4-VdKWfXWe4I0GhW-z3taaf8VRSdxSF4ot5J1EB_hpFEDO0X6Hd_dD-1blJnJCbgpaDT_4weCjDxn8XVn6vb82ySmEDj62gkmK66nUPWK_65r8OXxKc9b09Us6_FyLo7YZwb8OCsuR8eJNadEsqC04ryKJzXTJQO7GLGGUsWUDrWqGEhG2kZGCd2ZNOREI4xTiBQnB9hvw-_vGkI7kPg-1l8" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        </div>

                        <div className="break-inside-avoid rounded-xl overflow-hidden bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-center items-center text-center group relative cursor-zoom-in">
                            <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white mb-2 leading-tight">"Nested Learning: A New Framework for Deep Learning"</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">An Overview of Key Concepts and Applications</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Google Research</span>
                            </div>
                        </div>

                        <div className="break-inside-avoid rounded-xl overflow-hidden group relative cursor-zoom-in">
                            <img alt="Ice block with coke" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeHTiTH4Pp-EPsStilXlMNeQRib0epMTPNDL0rCeukGc5wkFAWnPGQPmljLGol_Aj4zEkKvFDONNih41UWt3DRY5lA22LvUlrvw-CxamYH81AayuXLHcynBvw33svdYZuj_kHNKHAxBZQTZHZv88u4Dk_Pgle57lZYfQxrKruIg036BjrOLnJs2RJodaMrrK5qF70LwznI9hJl6hKEGtQD7wxSskDEC-R3YYMmB-Qc-HG5Iz-S9ow311WHvBKmOsK9OENwEZl7fZA" />
                        </div>

                        <div className="break-inside-avoid rounded-xl overflow-hidden group relative cursor-zoom-in">
                            <img alt="Perfume in jungle" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe-ax10bLY995jJv3ik9owhcinTNm9rJQD8icxOE4a1Ofz5ifwCidCcPPXwV1wWeYXUaUzMEfN2l-GvQO28B-IQuk5e4GJxKkaMutGv6arhzFm8g-Jujc_odk9Ns89rKgx1rEE5OLkpuwA__3MzXL19E7xmyjxawsRNfh-HlwvAcc9SBBibAZZuJHnKZz4Le0QsvQ09x88WkM9q0LJRHJ-eF2DDZXEAsqYDZ07RAsq8gTTeZJmdBP_RvOmj-wuGNRS9-jf-oquI2Y" />
                        </div>

                        <div className="break-inside-avoid rounded-xl overflow-hidden group relative cursor-zoom-in">
                            <img alt="Product nature" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgsEliygpw5OUrxPVbAHThDW-ZnIryKv7VGyS5Gtmnc3JHkyAdrkEYvWV_kRzMKw-e-C-l1nvUpR5UMJA_Rn1NmL7dex1mVwcrM_1FPIPhjavswh0oeTcDWane3oDoyRyEecLdTVbyqlF_UWxv-389qejIj9_9r309dz3_RHzAYRjuP7QPBFAIyF5L8dBOKhzPSLJ-FogFuMC-s5sKVlPo7l55st0aNTzkR6vJmcdKeBvLsy4nMtVpaCBSfl1X_8U4UJuJFYPUJWA" />
                        </div>

                        <div className="break-inside-avoid rounded-xl overflow-hidden group relative cursor-zoom-in">
                            <img alt="Abstract gradient" className="w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwnO_m0MW-R0b4sLH7_hquTf6bO8lSKELV1esp3-b-ohDngMAoC5sMSfrMMG2k5xpPYzMmkVJhxNkYTpO89QeV9v562OHVqj1tHE-OqnExmQ0PX4mleKVmZv9RGoUdXJWsDUdQTM-f56T2gwGQLMyDC1Nb-JTCxTxSVUGzoCvZb6iRd5hCfQxQfo_yJTU_mH8Z73Z2IXNVb316vt0hdrG5H2s51eGms4JDXoyjwmIMDeUZB9kYLWxffTLI4mUSEnWWLF4RklPzLgw" />
                        </div>
                    </div>
                </section>

                {/* Floating Help Bubble */}
                <button className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30">
                    <Icons.HelpCircle size={24} />
                </button>
            </div>
        </div>
    );
};

export default ImageStudio;
