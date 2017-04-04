import sys
import numpy
import scipy.stats
import pandas
import random
from sklearn import cluster, metrics
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
import matplotlib.pyplot as plt


directory = '../data/processed/'


def random_sampling(data_frame,fraction):
    print "Doing Random Sampling with fraction "+str(fraction)
    rows = random.sample(data_frame.index,(int)(len(data_frame)*fraction))
    # print rows
    # print data_frame.iloc[rows]
    return data_frame.iloc[rows]


def find_k_for_kmean(data_frame):
    print "Getting elbow for k-mean clustering by clustering the data with various different k (1-10)"
    i=1
    dic = []
    while(i<=10):
        km = cluster.KMeans(n_clusters=i)
        km.fit(data_frame)
        dic.append((i,km.inertia_))
        i+=1
    file_name = directory+'kmean.csv'
    print "Creating file "+file_name
    dicDF = pandas.DataFrame(dic)
    dicDF.columns = ['cluster_size','value']
    dicDF.to_csv(file_name,sep=',',index=False)
    print "K by elbow method is "+str(3)



def stratified_sampling(data_frame,no_of_clusters,fraction):
    print "Doing stratified sampling where no. of clusters "+str(no_of_clusters)+" and fraction "+str(fraction)
    kmean = cluster.KMeans(n_clusters=no_of_clusters)
    kmean.fit(data_frame)
    data_frame['kmean'] = kmean.labels_
    # from each cluster get some values
    result_data_frame = pandas.DataFrame([],columns=data_frame.columns.values)
    for i in range(no_of_clusters):
        temp = data_frame.loc[data_frame['kmean']==i]
        length = len(temp.index)
        random_index = random.sample(range(length),int(length*fraction))
        random_data_frame = temp.iloc[random_index]
        result_data_frame = result_data_frame.append(random_data_frame)
    result_data_frame = result_data_frame.drop('kmean',1)
    return result_data_frame


def data_pca(df1,df2):
    print "Starting PCA:"
    pca = PCA()
    col_names = df1.columns.values
    print "Random Sampling"
    pca.fit_transform(df1)
    eigen_values_1 = pca.explained_variance_
    top_1 = pca.components_
    file_name = directory+'pca_components_random.csv'
    print "Creating file "+file_name
    topDF = pandas.DataFrame(top_1)
    topDF.to_csv(file_name,sep=',',index=False)
    print "Stratified Sampling"
    pca.fit_transform(df2)
    eigen_values_2 = pca.explained_variance_
    top_2 = pca.components_
    file_name = directory+'pca_components_stratified.csv'
    print "Creating file "+file_name
    topDF = pandas.DataFrame(top_2)
    topDF.to_csv(file_name,sep=',',index=False)
    eigen_tuple_list = []
    for i in range(len(eigen_values_1)):
        eigen_tuple_list.append((i+1,eigen_values_1[i],eigen_values_2[i]))
    file_name = directory+'pca_eigens.csv'
    print "Creating file "+file_name
    tupDF = pandas.DataFrame(eigen_tuple_list)
    tupDF.columns = ['variable','col1','col2']
    tupDF.to_csv(file_name,sep=',',index=False)
    # By observing the Eigen value plot no_of_components is found to be 8
    print "Intrinsic Dimensionality: "+str(8)
    sq_sum_1 = {}
    for i in range(len(top_1[0])):
        sum = 0
        for j in range(8):
            sum += top_1[j][i]**2
        s = col_names[i]
        sq_sum_1[s] = sum
    sq_sum_2 = {}
    for i in range(len(top_2[0])):
        sum = 0
        for j in range(8):
            sum += top_2[j][i]**2
        s = col_names[i]
        sq_sum_2[s] = sum
    tup_list = []
    for i in range(len(col_names)):
        tup_list.append((col_names[i],sq_sum_1[col_names[i]],sq_sum_2[col_names[i]]))
    tup_list = sorted(tup_list, key=lambda x:-1*x[2])
    print "Top 3 PCA Loadings: "+tup_list[0][0]+", "+tup_list[1][0]+' and '+tup_list[2][0]
    top3_col_list = []
    for i in range(3):
        top3_col_list.append(tup_list[i][0])
    file_name = directory+'scree_loadings.csv'
    print "Creating file "+file_name
    tupDF = pandas.DataFrame(tup_list)
    tupDF.columns = ['variable','col1','col2']
    tupDF.to_csv(file_name,sep=',',index=False)
    return top3_col_list


def find_pca2(df1,df2,file_name):
    print "PCA 2 started"
    pca = PCA(n_components=2)
    random_sample = pandas.DataFrame(pca.fit_transform(df1))
    stratified_sample = pandas.DataFrame(pca.fit_transform(df2))
    random_sample.columns = ['PC1','PC2']
    stratified_sample.columns = ['PC1','PC2']
    type1 = pandas.DataFrame(numpy.ones([len(random_sample.index),1], dtype=int),columns=['type'])
    random_sample = pandas.concat([random_sample, type1], axis=1)
    type2 = pandas.DataFrame(numpy.ones([len(stratified_sample.index),1], dtype=int)+1,columns=['type'])
    stratified_sample = pandas.concat([stratified_sample, type2], axis=1)
    sample = pandas.concat([random_sample, stratified_sample], axis=0)
    print "PCA 2 finished"
    file_name = directory + file_name
    print "Creating file "+file_name
    sample.to_csv(file_name,sep=',',index=False)


def find_MDS_euclidean(df1,df2,file_name):
    print "MDS (euclidean) started"
    dis_mat_random = metrics.pairwise_distances(df1, metric = 'euclidean')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    random_sample = pandas.DataFrame(mds.fit_transform(dis_mat_random))
    dis_mat_stratified = metrics.pairwise_distances(df2, metric = 'euclidean')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    stratified_sample = pandas.DataFrame(mds.fit_transform(dis_mat_stratified))
    random_sample.columns = ['PC1','PC2']
    stratified_sample.columns = ['PC1','PC2']
    type1 = pandas.DataFrame(numpy.ones([len(random_sample.index),1], dtype=int),columns=['type'])
    random_sample = pandas.concat([random_sample, type1], axis=1)
    type2 = pandas.DataFrame(numpy.ones([len(stratified_sample.index),1], dtype=int)+1,columns=['type'])
    stratified_sample = pandas.concat([stratified_sample, type2], axis=1)
    sample = pandas.concat([random_sample, stratified_sample], axis=0)
    print "MDS (euclidean) finished"
    file_name = directory + file_name
    print "Creating file "+file_name
    sample.to_csv(file_name,sep=',',index=False)


def find_MDS_correlation(df1,df2,file_name):
    print "MDS (correlation) started"
    dis_mat_random = metrics.pairwise_distances(df1, metric = 'correlation')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    random_sample = pandas.DataFrame(mds.fit_transform(dis_mat_random))
    dis_mat_stratified = metrics.pairwise_distances(df2, metric = 'correlation')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    stratified_sample = pandas.DataFrame(mds.fit_transform(dis_mat_stratified))
    random_sample.columns = ['PC1','PC2']
    stratified_sample.columns = ['PC1','PC2']
    type1 = pandas.DataFrame(numpy.ones([len(random_sample.index),1], dtype=int),columns=['type'])
    random_sample = pandas.concat([random_sample, type1], axis=1)
    type2 = pandas.DataFrame(numpy.ones([len(stratified_sample.index),1], dtype=int)+1,columns=['type'])
    stratified_sample = pandas.concat([stratified_sample, type2], axis=1)
    sample = pandas.concat([random_sample, stratified_sample], axis=0)
    print "MDS (correlation) finished"
    file_name = directory + file_name
    print "Creating file "+file_name
    sample.to_csv(file_name,sep=',',index=False)


def find_pca3(df1,df2,file_name,col_list):
    print "PCA 3 started"
    pca = PCA(n_components=3)
    random_sample = pandas.DataFrame(pca.fit_transform(df1))
    stratified_sample = pandas.DataFrame(pca.fit_transform(df2))
    random_sample.columns = ['PC1','PC2','PC3']
    stratified_sample.columns = ['PC1','PC2','PC3']
    type1 = pandas.DataFrame(numpy.ones([len(random_sample.index),1], dtype=int),columns=['type'])
    random_sample = pandas.concat([random_sample, type1], axis=1)
    type2 = pandas.DataFrame(numpy.ones([len(stratified_sample.index),1], dtype=int)+1,columns=['type'])
    stratified_sample = pandas.concat([stratified_sample, type2], axis=1)
    sample = pandas.concat([random_sample, stratified_sample], axis=0)
    print "PCA 3 finished"
    file_name = directory + file_name
    print "Creating file "+file_name
    sample.to_csv(file_name,sep=',',index=False)
    random_tuple = []
    for i in range(len(df1)):
        random_tuple.append((df1[col_list[0]].iloc[i],df1[col_list[1]].iloc[i],df1[col_list[2]].iloc[i],'1'))
    random_tuple_df = pandas.DataFrame(random_tuple)
    random_tuple_df.columns = [col_list[0],col_list[1],col_list[2],'type']
    stratified_tuple = []
    for i in range(len(df2)):
        stratified_tuple.append((df2[col_list[0]].iloc[i],df2[col_list[1]].iloc[i],df2[col_list[2]].iloc[i],'2'))
    stratified_tuple_df = pandas.DataFrame(stratified_tuple)
    stratified_tuple_df.columns = [col_list[0],col_list[1],col_list[2],'type']
    sample = pandas.concat([random_tuple_df, stratified_tuple_df], axis=0)
    file_name = directory + 'pca3_loadings.csv'
    print "Creating file "+file_name
    sample.to_csv(file_name,sep=',',index=False)


def main(filename):
    data_frame = pandas.read_csv("../data/"+filename)
    data_frame = data_frame.drop(data_frame.columns[0],axis=1)
    data_frame = data_frame.fillna(value=0)
    random_sample = random_sampling(data_frame,0.05)
    find_k_for_kmean(data_frame)
    # found the elbow at 3 thus, number of clusters to be created are 3
    stratified_sample = stratified_sampling(data_frame,3,0.05)
    col_list = data_pca(random_sample,stratified_sample)
    find_pca2(random_sample,stratified_sample,'pca2.csv')
    find_MDS_euclidean(random_sample,stratified_sample,'mds_euclidean.csv')
    find_MDS_correlation(random_sample,stratified_sample,'mds_correlation.csv')
    find_pca3(random_sample,stratified_sample,'pca3.csv',col_list)


if __name__=='__main__':
    if(len(sys.argv)<2):
        print "Command format: python GenVisData.py <csv_filename>"
    else:
        main(sys.argv[1])
