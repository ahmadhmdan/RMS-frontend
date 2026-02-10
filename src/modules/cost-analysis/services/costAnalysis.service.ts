import axiosInstance from '../../../core/api/axiosInstance';

export const getCostAnalysisData = async () => {
    const res = await axiosInstance.get('/cost-analysis');
    return res.data;
};

export const saveCostAnalysis = async (payload: any) => {
    const res = await axiosInstance.post('/cost-analysis', payload);
    return res.data;
};

export const costAnalysisService = {
    getAll: () => axiosInstance.get('/cost-analysis/list'),
}

export const getCostAnalysisById = async (id: string) => {
    const res = await axiosInstance.get(`/cost-analysis/${id}`);
    return res.data;
};